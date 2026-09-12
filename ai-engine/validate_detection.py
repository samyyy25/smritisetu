import sys
from decline_detection import get_db_connection, run_decline_detection

def validate():
    conn = get_db_connection()
    
    try:
        # Run detection WITHOUT saving to DB just to validate the logic
        results = run_decline_detection(conn, save_to_db=False)
        
        # Fetch ground truth (syntheticProfile)
        with conn.cursor() as cur:
            cur.execute('SELECT id, "syntheticProfile" FROM "Patient"')
            patients = cur.fetchall()
            
        total_declining = 0
        total_stable = 0
        
        true_positives = 0
        false_positives = 0
        
        for pid, profile in patients:
            if profile == 'declining':
                total_declining += 1
                if pid in results and len(results[pid]) > 0:
                    true_positives += 1
            elif profile == 'stable':
                total_stable += 1
                if pid in results and len(results[pid]) > 0:
                    false_positives += 1
                    
        print("--- Validation Results ---")
        print(f"Total synthetic 'declining' patients: {total_declining}")
        print(f"Correctly flagged (True Positives): {true_positives} / {total_declining}")
        print()
        print(f"Total synthetic 'stable' patients:    {total_stable}")
        print(f"Incorrectly flagged (False Positives): {false_positives} / {total_stable}")
        print("--------------------------")
        
    finally:
        conn.close()

if __name__ == "__main__":
    validate()
