import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AdaptiveDifficultyResult {
  patientId: string;
  gameType: string;
  difficultyLevel: DifficultyLevel;
  previousDifficulty: DifficultyLevel;
  change: 'increased' | 'decreased' | 'unchanged';
  message: string | null;
  sessionsCount: number;
  avgAccuracyPct: number | null;
}

/**
 * Shared adaptive difficulty loader for all six games.
 * Fetches computed difficulty based on the patient's last 3 sessions for that gameType.
 */
export async function getAdaptiveDifficulty(
  gameType: string,
  patientId: string = DEMO_PATIENT_ID
): Promise<AdaptiveDifficultyResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/difficulty/${gameType}`);
    if (res.ok) {
      const data = await res.json();
      return {
        patientId,
        gameType,
        difficultyLevel: (data.difficultyLevel as DifficultyLevel) || 'easy',
        previousDifficulty: (data.previousDifficulty as DifficultyLevel) || 'easy',
        change: data.change || 'unchanged',
        message: data.message || null,
        sessionsCount: data.sessionsCount || 0,
        avgAccuracyPct: data.avgAccuracyPct ?? null,
      };
    }
  } catch (err) {
    console.warn(`[AdaptiveDifficulty] Failed to fetch for ${gameType}:`, err);
  }

  // Fallback default
  return {
    patientId,
    gameType,
    difficultyLevel: 'easy',
    previousDifficulty: 'easy',
    change: 'unchanged',
    message: null,
    sessionsCount: 0,
    avgAccuracyPct: null,
  };
}
