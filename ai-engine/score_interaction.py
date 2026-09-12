"""
SmritiSetu AI Engine - Cognitive Interaction Scoring Script
Evaluates response accuracy, reaction latency, emotional stability,
and generates a composite Cognitive Health Index (CHI) with risk alerts.
"""

import json
from pathlib import Path

def compute_cognitive_index(interaction: dict) -> dict:
    """
    Computes a composite score (0-100) based on:
    - Recall Score (50%)
    - Reaction Time latency factor (25%)
    - Hesitation count & fluency (15%)
    - Emotional sentiment stability (10%)
    """
    recall = interaction.get("recallScore", 0.5)
    rt = interaction.get("reactionTimeSeconds", 8.0)
    pauses = interaction.get("hesitationPauses", 2)
    sentiment = interaction.get("sentiment", "Neutral")

    # Reaction time score: 2s = 1.0, 20s = 0.0
    rt_factor = max(0.0, min(1.0, (20.0 - rt) / 18.0))

    # Pause fluency factor: 0 pauses = 1.0, 5+ pauses = 0.0
    fluency_factor = max(0.0, min(1.0, (5.0 - pauses) / 5.0))

    # Sentiment score
    sentiment_map = {
        "Confident": 1.0,
        "Fond/Nostalgic": 1.0,
        "Neutral": 0.75,
        "Hesitant": 0.5,
        "Confused": 0.3,
        "Agitated": 0.1,
    }
    sentiment_factor = sentiment_map.get(sentiment, 0.6)

    # Weighted Composite Score (0.0 to 100.0)
    chi = (
        (recall * 0.50) +
        (rt_factor * 0.25) +
        (fluency_factor * 0.15) +
        (sentiment_factor * 0.10)
    ) * 100.0

    chi = round(chi, 1)

    # Determine risk alert level
    if chi < 45.0:
        alert = "CRITICAL: Significant recall confusion and hesitation detected"
    elif chi < 65.0:
        alert = "WARNING: Moderate memory drift or increased response latency"
    else:
        alert = "STABLE: Strong recall stability and emotional fluency"

    return {
        "interactionId": interaction.get("interactionId"),
        "patientName": interaction.get("patientName"),
        "cognitiveHealthIndex": chi,
        "assessment": alert,
        "details": {
            "recallComponent": round(recall * 50, 1),
            "latencyComponent": round(rt_factor * 25, 1),
            "fluencyComponent": round(fluency_factor * 15, 1),
            "sentimentComponent": round(sentiment_factor * 10, 1),
        }
    }

def main():
    print("[SmritiSetu AI Engine] Scoring interaction records...")
    data_file = Path(__file__).parent / "data" / "synthetic_interactions.json"

    if not data_file.exists():
        print("[Notice] No synthetic data found. Generating first...")
        from generate_data import main as run_gen
        run_gen()

    with open(data_file, "r", encoding="utf-8") as f:
        interactions = json.load(f)

    results = [compute_cognitive_index(item) for item in interactions[:10]]

    print("\n--- Sample Scored Interactions (Top 10) ---")
    for res in results:
        print(f"[{res['patientName']}] CHI: {res['cognitiveHealthIndex']}/100 | {res['assessment']}")

    summary_avg = sum(r["cognitiveHealthIndex"] for r in results) / len(results)
    print(f"\n[Summary] Batch Average Cognitive Health Index: {summary_avg:.1f}/100")

if __name__ == "__main__":
    main()
