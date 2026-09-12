"""
SmritiSetu AI Engine — generate_synthetic_data.py
==================================================
Generates exactly 4 well-defined demo patients (Anita Devi, Ramesh Das,
Maya Devi, Bikash Saikia) with 90 days of GameSession data each, alerts,
and memories into PostgreSQL.

Usage
-----
  cd ai-engine
  pip install -r requirements.txt   # psycopg2-binary, python-dotenv
  python generate_synthetic_data.py
"""

import os
import sys

# Fix Windows console encoding so emoji prints correctly
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import math
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from dotenv import load_dotenv

# ── Load .env from backend ──────────────────────────────────────────────────
env_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded .env from {env_path}")
else:
    print(f"⚠️  .env not found at {env_path}, using environment variables.")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set. Cannot continue.")
    sys.exit(1)

try:
    import psycopg2
    from psycopg2.extras import execute_batch
except ImportError:
    print("❌ psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)


# ── Parse DATABASE_URL → psycopg2 DSN ──────────────────────────────────────
def parse_db_url(url: str) -> dict:
    """Convert postgresql://user[:pass]@host:port/dbname to psycopg2 kwargs."""
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


# ── Exactly 4 Demo Patients Definition ──────────────────────────────────────
GAME_TYPES = [
    "memory_match",
    "who_is_this",
    "festival_memories",
    "remember_and_speak",
    "daily_challenge",
    "life_story",
]

PATIENT_TEMPLATES = [
    # 1. Anita Devi (DEMO_PATIENT_ID, declining, Attention alert)
    dict(
        id="23f55848-e317-4a06-ae05-3aa42d94cd10",
        name="Anita Devi",
        age=72,
        avatarUrl="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
        emergencyContactName="Priya Devi (Daughter)",
        emergencyContactPhone="+91 98765 43210",
        preferredLanguage="Assamese",
        profile="declining",
    ),
    # 2. Ramesh Das (stable, no active alert)
    dict(
        id="a1b2c3d4-e5f6-4a01-9b01-111111111111",
        name="Ramesh Das",
        age=68,
        avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
        emergencyContactName="Utpal Das (Son)",
        emergencyContactPhone="+91 98765 43211",
        preferredLanguage="Assamese",
        profile="stable",
    ),
    # 3. Maya Devi (declining, Monitor alert - hesitation driven)
    dict(
        id="a1b2c3d4-e5f6-4a02-9b02-222222222222",
        name="Maya Devi",
        age=75,
        avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        emergencyContactName="Sunil Thapa (Son)",
        emergencyContactPhone="+91 98765 43212",
        preferredLanguage="Nepali",
        profile="declining",
    ),
    # 4. Bikash Saikia (stable, no active alert)
    dict(
        id="a1b2c3d4-e5f6-4a03-9b03-333333333333",
        name="Bikash Saikia",
        age=70,
        avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
        emergencyContactName="Mainao Saikia (Daughter)",
        emergencyContactPhone="+91 98765 43213",
        preferredLanguage="Bodo",
        profile="stable",
    ),
]

# The demo patient: Anita Devi
DEMO_PATIENT_INDEX = 0
SIM_DAYS = 90
SESSIONS_PER_DAY_RANGE = (2, 3)


# ── Noise helpers ───────────────────────────────────────────────────────────
def gaussian_clamp(mean: float, std: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, random.gauss(mean, std)))


def bernoulli(p: float) -> bool:
    return random.random() < p


def generate_session(
    patient_id: str,
    day_offset: int,
    profile: str,
    patient_index: int,
) -> dict:
    """Generate a single GameSession record."""
    game_type = random.choice(GAME_TYPES)
    has_question = game_type != "remember_and_speak"

    progress = day_offset / SIM_DAYS  # 0 (90 days ago) -> 1 (today)

    if profile == "stable":
        accuracy = gaussian_clamp(0.84, 0.06, 0.65, 0.98)
        rt = int(gaussian_clamp(2800, 300, 1800, 4200))
        answer_changes = 1 if bernoulli(0.12) else 0
        hint_used = bernoulli(0.10)
    elif patient_index == 0:
        # Anita Devi: Reaction time slowed & accuracy drift
        acc_mean = max(0.60, 0.88 - progress * 0.28)
        accuracy = gaussian_clamp(acc_mean, 0.08, 0.45, 0.95)
        rt_mean = 2600 + progress * 1500
        rt = int(gaussian_clamp(rt_mean, 400, 2000, 6500))
        answer_changes = 1 if bernoulli(0.10 + progress * 0.35) else 0
        hint_used = bernoulli(0.10 + progress * 0.30)
    else:
        # Maya Devi: Hesitation / answer revisions surge
        acc_mean = max(0.70, 0.85 - progress * 0.14)
        accuracy = gaussian_clamp(acc_mean, 0.07, 0.55, 0.95)
        rt_mean = 2800 + progress * 900
        rt = int(gaussian_clamp(rt_mean, 350, 2200, 5500))
        # Surge in answer changes
        if bernoulli(0.20 + progress * 0.65):
            answer_changes = 2 if bernoulli(0.40) else 1
        else:
            answer_changes = 0
        hint_used = bernoulli(0.15 + progress * 0.35)

    correct = bernoulli(accuracy)
    difficulty = "medium" if correct else "easy"
    session_duration = int(rt * (3 + random.random() * 3))

    base_date = datetime.now(timezone.utc) - timedelta(days=SIM_DAYS - day_offset)
    hour = random.randint(8, 20)
    minute = random.randint(0, 59)
    started_at = base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    completed_at = started_at + timedelta(milliseconds=session_duration)

    meta = {
        "accuracyPct": 100 if correct else 0,
        "difficulty": "adaptive",
        "hesitationCount": answer_changes,
    }

    return {
        "id": str(uuid.uuid4()),
        "patientId": patient_id,
        "gameType": game_type,
        "questionId": str(uuid.uuid4()) if has_question else None,
        "responseTimeMs": rt,
        "sessionDurationMs": session_duration,
        "correct": correct,
        "hintUsed": hint_used,
        "answerChanges": answer_changes,
        "difficultyLevel": difficulty,
        "startedAt": started_at,
        "completedAt": completed_at,
        "timestamp": started_at,
        "metadataJson": json.dumps(meta),
    }


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    print("🌱 SmritiSetu — 4-Patient Synthetic Data Generator")
    print(f"   Patients: {len(PATIENT_TEMPLATES)}")
    print(f"   Days:     {SIM_DAYS}")
    print()

    dsn = parse_db_url(DATABASE_URL)
    conn = psycopg2.connect(**dsn)
    conn.autocommit = False
    cur = conn.cursor()

    # ── Truncate existing data cleanly ──────────────────────────────────────
    print("🗑️  Clearing previous tables…")
    cur.execute('DELETE FROM "LocationLog"')
    cur.execute('DELETE FROM "SavedPlace"')
    cur.execute('DELETE FROM "Reminder"')
    cur.execute('DELETE FROM "DailyRoutine"')
    cur.execute('DELETE FROM "Caregiver"')
    cur.execute('DELETE FROM "Alert"')
    cur.execute('DELETE FROM "GameSession"')
    cur.execute('DELETE FROM "Memory"')
    cur.execute('DELETE FROM "Patient"')
    conn.commit()
    print("   ✅ Tables cleared.\n")

    demo_patient_id: str = PATIENT_TEMPLATES[0]["id"]
    total_sessions = 0

    for idx, tmpl in enumerate(PATIENT_TEMPLATES):
        patient_id = tmpl["id"]
        profile = tmpl["profile"]

        # Insert patient
        cur.execute(
            """
            INSERT INTO "Patient"
              (id, name, age, "avatarUrl", "emergencyContactName", "emergencyContactPhone", "preferredLanguage", "syntheticProfile", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                patient_id,
                tmpl["name"],
                tmpl["age"],
                tmpl["avatarUrl"],
                tmpl["emergencyContactName"],
                tmpl["emergencyContactPhone"],
                tmpl["preferredLanguage"],
                profile,
                datetime.now(timezone.utc) - timedelta(days=SIM_DAYS),
            ),
        )

        # Generate sessions
        sessions: list[dict] = []
        for day in range(SIM_DAYS):
            n_sessions = random.randint(*SESSIONS_PER_DAY_RANGE)
            for _ in range(n_sessions):
                sessions.append(generate_session(patient_id, day, profile, idx))

        execute_batch(
            cur,
            """
            INSERT INTO "GameSession"
              (id, "patientId", "gameType", "questionId",
               "responseTimeMs", "sessionDurationMs", correct, "hintUsed",
               "answerChanges", "difficultyLevel", "startedAt", "completedAt",
               timestamp, "metadataJson")
            VALUES
              (%(id)s, %(patientId)s, %(gameType)s, %(questionId)s,
               %(responseTimeMs)s, %(sessionDurationMs)s, %(correct)s, %(hintUsed)s,
               %(answerChanges)s, %(difficultyLevel)s, %(startedAt)s, %(completedAt)s,
               %(timestamp)s, %(metadataJson)s)
            """,
            sessions,
            page_size=200,
        )

        total_sessions += len(sessions)
        print(
            f"  [{idx+1:02d}/{len(PATIENT_TEMPLATES)}] "
            f"{'🔻' if profile == 'declining' else '🟢'} "
            f"{tmpl['name']:<20} "
            f"profile={profile:<9} "
            f"sessions={len(sessions):4d}"
            + (" ← DEMO PATIENT" if idx == DEMO_PATIENT_INDEX else "")
        )

    # Insert Specific Demo Alerts
    print("\n🚨 Seeding Alert records...")
    # Anita Devi (Attention)
    cur.execute(
        """
        INSERT INTO "Alert"
          (id, "patientId", "alertType", "reasonText", "metricChangesJson", "createdAt", status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            "alt_anita_001",
            "23f55848-e317-4a06-ae05-3aa42d94cd10",
            "COGNITIVE_CHANGE",
            "Reaction time slowed by 34% during festival sequence recall and pattern matching over the last 14 days.",
            json.dumps({"reactionTimeIncreasePct": 34, "accuracyChangePct": -12, "timeframe": "Last 14 Days"}),
            datetime.now(timezone.utc) - timedelta(hours=6),
            "ACTIVE",
        ),
    )
    # Maya Devi (Monitor)
    cur.execute(
        """
        INSERT INTO "Alert"
          (id, "patientId", "alertType", "reasonText", "metricChangesJson", "createdAt", status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            "alt_maya_002",
            "a1b2c3d4-e5f6-4a02-9b02-222222222222",
            "MONITORING_SIGNAL",
            "Hesitation rate increased by 45% with answer revisions doubling across daily challenges over the last 10 days.",
            json.dumps({"hesitationRateIncrease": 1.45, "answerChangesIncrease": 2.1, "timeframe": "Last 10 Days"}),
            datetime.now(timezone.utc) - timedelta(hours=18),
            "MONITOR",
        ),
    )

    conn.commit()
    cur.close()
    conn.close()

    print("═" * 60)
    print(f"✅ Total sessions inserted: {total_sessions:,}")
    print(f"DEMO_PATIENT_ID = \"{demo_patient_id}\" (Anita Devi)")
    print("═" * 60)


if __name__ == "__main__":
    main()
