# SmritiSetu AI Engine

Independent Python module for generating synthetic patient cognitive interactions and evaluating cognitive memory scores.

## Overview
- `generate_data.py`: Generates realistic synthetic patient interactions across multiple memory categories (Family, Childhood, Daily Routines), with simulated recall scores, response reaction latency, and sentiment.
- `score_interaction.py`: Processes interaction logs and calculates a weighted composite **Cognitive Health Index (CHI)** (0–100) combining recall accuracy, reaction time latency, verbal fluency, and emotional sentiment.

## Setup & Running

1. Open a terminal in `/ai-engine`:
   ```bash
   cd ai-engine
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the data generator:
   ```bash
   python generate_data.py
   ```
   *(Saves synthetic JSON records to `ai-engine/data/synthetic_interactions.json`)*

5. Run the scoring engine:
   ```bash
   python score_interaction.py
   ```
