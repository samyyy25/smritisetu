"""
SmritiSetu AI Engine - Data Generation Script
Generates synthetic patient memory interactions, recall responses, and sentiment logs.
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

PATIENTS = [
    {"id": "pat_001", "name": "Ramesh Sharma", "age": 74, "stage": "Mild Cognitive Impairment"},
    {"id": "pat_002", "name": "Savitri Devi", "age": 79, "stage": "Early Alzheimer's"},
    {"id": "pat_003", "name": "Harish Patel", "age": 68, "stage": "Mild Cognitive Impairment"},
]

PROMPT_CATEGORIES = [
    {
        "category": "Family",
        "prompts": [
            "Who is the person holding the flowers in this family photo?",
            "Can you tell me your elder daughter's name and when she visited?",
            "What was your grandson Kabir's favorite game to play with you?",
        ]
    },
    {
        "category": "Childhood & Roots",
        "prompts": [
            "Which city did you grow up in during your school years?",
            "What was the name of your childhood school and teacher?",
            "What sweet dish did your mother make for Diwali festivals?",
        ]
    },
    {
        "category": "Daily Life & Routines",
        "prompts": [
            "What did you have for breakfast this morning?",
            "What color was your favorite morning walking jacket?",
            "Do you remember taking your morning heart medication today?",
        ]
    },
]

SENTIMENTS = ["Confident", "Fond/Nostalgic", "Neutral", "Hesitant", "Confused", "Agitated"]

def generate_synthetic_interaction(patient: dict, days_ago: int) -> dict:
    cat_item = random.choice(PROMPT_CATEGORIES)
    category = cat_item["category"]
    prompt_text = random.choice(cat_item["prompts"])

    # Simulate degradation or variation by stage
    is_early = patient["stage"] == "Mild Cognitive Impairment"
    base_accuracy = 0.82 if is_early else 0.65
    recall_score = round(min(1.0, max(0.1, random.gauss(base_accuracy, 0.15))), 2)

    # Reaction time in seconds
    reaction_time = round(random.uniform(2.5, 12.0) if is_early else random.uniform(5.0, 22.0), 1)

    if recall_score > 0.75:
        sentiment = random.choice(["Confident", "Fond/Nostalgic"])
    elif recall_score > 0.5:
        sentiment = random.choice(["Neutral", "Hesitant"])
    else:
        sentiment = random.choice(["Confused", "Agitated"])

    timestamp = (datetime.now() - timedelta(days=days_ago, hours=random.randint(1, 10))).isoformat()

    return {
        "interactionId": f"int_{random.randint(10000, 99999)}",
        "patientId": patient["id"],
        "patientName": patient["name"],
        "stage": patient["stage"],
        "category": category,
        "promptText": prompt_text,
        "recordedAt": timestamp,
        "recallScore": recall_score,
        "reactionTimeSeconds": reaction_time,
        "sentiment": sentiment,
        "hesitationPauses": random.randint(0, 6),
        "wordCount": random.randint(5, 45),
    }

def main():
    print("[SmritiSetu AI Engine] Generating synthetic interaction logs...")
    output_dir = Path(__file__).parent / "data"
    output_dir.mkdir(exist_ok=True)

    all_interactions = []
    for patient in PATIENTS:
        for days in range(14, -1, -1):  # Past 14 days of logs
            for _ in range(random.randint(1, 3)):
                interaction = generate_synthetic_interaction(patient, days)
                all_interactions.append(interaction)

    output_file = output_dir / "synthetic_interactions.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_interactions, f, indent=2)

    print(f"[SmritiSetu AI Engine] Successfully generated {len(all_interactions)} interaction records.")
    print(f"[SmritiSetu AI Engine] Saved to: {output_file.resolve()}")

if __name__ == "__main__":
    main()
