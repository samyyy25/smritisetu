/**
 * SmritiSetu — Frontend Shared Configuration
 *
 * DEMO_PATIENT_ID
 * ───────────────
 * Set this to the UUID printed by `python generate_synthetic_data.py`
 * (look for the line that says  DEMO_PATIENT_ID = "...").
 *
 * Every screen that fetches patient data should import this constant
 * so the entire demo always references the same patient (Ramesh Sharma).
 *
 * Example usage:
 *   import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';
 *   fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/sessions?days=7`)
 */
export const DEMO_PATIENT_ID: string =
  (import.meta as any).env?.VITE_DEMO_PATIENT_ID ?? '23f55848-e317-4a06-ae05-3aa42d94cd10'; // Ramesh Sharma

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:5000';

