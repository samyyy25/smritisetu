import os
import uuid
import json
import psycopg2
import pandas as pd
import numpy as np

def parse_db_url(url: str) -> dict:
    url = url.replace("postgresql://", "").replace("postgres://", "")
    creds, rest = url.split("@", 1)
    if ":" in creds:
        user, password = creds.split(":", 1)
    else:
        user, password = creds, ""
    host_port, dbname = rest.split("/", 1)
    dbname = dbname.split("?")[0]
    if ":" in host_port:
        host, port = host_port.rsplit(":", 1)
    else:
        host, port = host_port, "5432"
    result = dict(host=host, port=int(port), dbname=dbname, user=user)
    if password:
        result["password"] = password
    return result

def get_db_connection():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("DATABASE_URL="):
                        db_url = line.strip().split("=", 1)[1].strip('"').strip("'")
                        break
    if not db_url:
        raise ValueError("DATABASE_URL not found")
    
    return psycopg2.connect(**parse_db_url(db_url))

def detect_decline_for_patient(patient_id: str, df: pd.DataFrame):
    """
    Returns a list of alerts to generate.
    Each alert is a dict: { type, reason, metrics }
    """
    if len(df) < 7:
        return []

    # Sort and set timestamp index for rolling window
    df = df.sort_values("timestamp")
    df = df.set_index("timestamp")
    
    # 1. Baseline from first 7 sessions
    baseline_df = df.head(7)
    
    base_acc_mean = baseline_df["correct"].mean()
    base_acc_std = baseline_df["correct"].std()
    
    base_rt_mean = baseline_df["responseTimeMs"].mean()
    base_rt_std = baseline_df["responseTimeMs"].std()
    
    base_ac_mean = baseline_df["answerChanges"].mean()
    base_ac_std = baseline_df["answerChanges"].std()

    # Avoid 0 std dev division issues and set realistic minimum noise thresholds
    base_acc_std = max(base_acc_std, 0.10) # At least 10% natural variance
    base_rt_std = max(base_rt_std, 500.0)  # At least 500ms natural variance
    base_ac_std = max(base_ac_std, 0.5)    # At least 0.5 clicks natural variance

    # 2. Rolling 7-day average
    numeric_cols = ["correct", "responseTimeMs", "answerChanges"]
    rolling_df = df[numeric_cols].rolling("7D").mean()
    
    alerts = []
    
    # Track sustained anomalies (3 consecutive sessions)
    decline_streak = 0
    hesitation_streak = 0
    
    # To prevent spamming, we only alert once per run if we find a trend
    alerted_decline = False
    alerted_hesitation = False

    # We iterate over the rolling stats to check for sustained deviations
    for i in range(len(rolling_df)):
        acc = rolling_df["correct"].iloc[i]
        rt = rolling_df["responseTimeMs"].iloc[i]
        ac = rolling_df["answerChanges"].iloc[i]
        
        # Deviation thresholds
        acc_drop = (base_acc_mean - acc) / base_acc_std
        rt_increase = (rt - base_rt_mean) / base_rt_std
        ac_increase = (ac - base_ac_mean) / base_ac_std
        
        is_decline = (acc_drop > 1.5) or (rt_increase > 1.5)
        is_hesitation = (ac_increase > 1.5) and (acc_drop <= 1.5) # Independent of accuracy drop
        
        if is_decline:
            decline_streak += 1
        else:
            decline_streak = 0
            
        if is_hesitation:
            hesitation_streak += 1
        else:
            hesitation_streak = 0
            
        if decline_streak >= 3 and not alerted_decline:
            acc_pct_change = ((acc - base_acc_mean) / max(base_acc_mean, 0.01)) * 100
            rt_pct_change = ((rt - base_rt_mean) / max(base_rt_mean, 1)) * 100
            
            reason = (f"Reaction time changed {rt_pct_change:+.0f}% and accuracy changed {acc_pct_change:+.0f}%. "
                      f"This is a monitoring signal, not a diagnosis.")
            
            alerts.append({
                "alertType": "Possible Change in Performance",
                "reasonText": reason,
                "metricChangesJson": json.dumps({
                    "baselineAccuracy": base_acc_mean,
                    "currentAccuracy": acc,
                    "baselineResponseTime": base_rt_mean,
                    "currentResponseTime": rt,
                    "disclaimer": "This is a monitoring signal, not a diagnosis."
                })
            })
            alerted_decline = True
            
        if hesitation_streak >= 3 and not alerted_hesitation and not alerted_decline:
            ac_pct_change = ((ac - base_ac_mean) / max(base_ac_mean, 0.1)) * 100
            reason = (f"Hesitation (answer changes) increased {ac_pct_change:+.0f}% while accuracy remained stable. "
                      f"This is a monitoring signal, not a diagnosis.")
            
            alerts.append({
                "alertType": "Monitoring Signal",
                "reasonText": reason,
                "metricChangesJson": json.dumps({
                    "baselineAnswerChanges": base_ac_mean,
                    "currentAnswerChanges": ac,
                    "disclaimer": "This is a monitoring signal, not a diagnosis."
                })
            })
            alerted_hesitation = True

    return alerts

def run_decline_detection(conn, save_to_db=True):
    """
    Runs the detection for all patients.
    If save_to_db is True, inserts alerts into the Alert table.
    Returns a dict mapping patient_id -> list of generated alerts.
    """
    query = """
    SELECT "patientId", "timestamp", "correct", "responseTimeMs", "answerChanges"
    FROM "GameSession"
    ORDER BY "timestamp" ASC
    """
    df = pd.read_sql(query, conn)
    
    # We map boolean 'correct' to 1.0 / 0.0 for accuracy averaging
    if not df.empty and df['correct'].dtype == bool:
        df['correct'] = df['correct'].astype(float)
        
    results = {}
    
    if df.empty:
        return results

    # Delete previous auto-generated monitoring alerts to avoid duplicates on re-runs
    if save_to_db:
        with conn.cursor() as cur:
            cur.execute("""
                DELETE FROM "Alert" 
                WHERE "alertType" IN ('Possible Change in Performance', 'Monitoring Signal')
            """)
        conn.commit()

    for patient_id, group_df in df.groupby("patientId"):
        alerts = detect_decline_for_patient(patient_id, group_df.copy())
        results[patient_id] = alerts
        
        if save_to_db and alerts:
            with conn.cursor() as cur:
                for alert in alerts:
                    cur.execute("""
                        INSERT INTO "Alert" (id, "patientId", "alertType", "reasonText", "metricChangesJson", "createdAt", status)
                        VALUES (%s, %s, %s, %s, %s, NOW(), 'ACTIVE')
                    """, (
                        str(uuid.uuid4()),
                        patient_id,
                        alert["alertType"],
                        alert["reasonText"],
                        alert["metricChangesJson"]
                    ))
            conn.commit()
            
    return results

if __name__ == "__main__":
    conn = get_db_connection()
    try:
        run_decline_detection(conn, save_to_db=True)
        print("Decline detection complete. Alerts saved to database.")
    finally:
        conn.close()
