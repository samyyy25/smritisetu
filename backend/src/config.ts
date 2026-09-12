/**
 * SmritiSetu — Shared Backend Configuration
 *
 * DEMO_PATIENT_ID
 * ───────────────
 * The single patient whose data all frontend screens should display
 * during demos. Set this to the UUID of the patient you want to feature
 * (it will be printed to the console the first time the seed/generate
 * script runs so you can copy-paste it here).
 *
 * Where to use it:
 *   - Frontend: src/config.ts  → DEMO_PATIENT_ID
 *   - Backend routes that need a "default" patient fallback
 *   - ai-engine/generate_synthetic_data.py → DEMO_PATIENT_INDEX
 */
export const DEMO_PATIENT_ID: string =
  process.env.DEMO_PATIENT_ID ?? '23f55848-e317-4a06-ae05-3aa42d94cd10'; // Ramesh Sharma

export const API_PORT: number = Number(process.env.PORT) || 5000;

