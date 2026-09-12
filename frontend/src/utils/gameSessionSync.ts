import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';
import { enqueueActivity } from './offlineQueue';

export interface GameSessionPayload {
  patientId?: string;
  gameType: string;
  questionId?: string | null;
  responseTimeMs: number;
  sessionDurationMs: number;
  correct: boolean;
  hintUsed: boolean;
  answerChanges: number;
  difficultyLevel?: string;
  startedAt: string;
  completedAt: string;
  timestamp?: string;
  metadataJson?: string;
}

export interface SaveSessionResult {
  status: 'saved' | 'queued_offline';
  postedSessionId: string | null;
  saveError: string | null;
  isOffline: boolean;
}

/**
 * Unified game session saver.
 * Tries to POST directly to /api/game-sessions; if offline or network fails,
 * safely enqueues the session locally so the results screen still displays smoothly.
 */
export async function saveGameSession(
  payload: GameSessionPayload,
  gameLabel: string = 'Cognitive Game'
): Promise<SaveSessionResult> {
  const finalPayload = {
    patientId: payload.patientId || DEMO_PATIENT_ID,
    gameType: payload.gameType,
    questionId: payload.questionId ?? null,
    responseTimeMs: payload.responseTimeMs,
    sessionDurationMs: payload.sessionDurationMs,
    correct: payload.correct,
    hintUsed: payload.hintUsed,
    answerChanges: payload.answerChanges,
    difficultyLevel: payload.difficultyLevel || 'easy',
    startedAt: payload.startedAt,
    completedAt: payload.completedAt,
    timestamp: payload.timestamp || payload.startedAt,
    metadataJson: payload.metadataJson || JSON.stringify({}),
  };

  // Try direct POST first if online
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(`${API_BASE_URL}/api/game-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        return {
          status: 'saved',
          postedSessionId: data.id || `sess_${Date.now()}`,
          saveError: null,
          isOffline: false,
        };
      }
    } catch (networkErr) {
      console.warn(`[GameSessionSync] Direct save failed for ${gameLabel}, falling back to offline queue:`, networkErr);
    }
  }

  // If we reach here, we are offline or direct POST failed -> enqueue locally!
  try {
    let accuracyPct = payload.correct ? 100 : 0;
    if (payload.metadataJson) {
      try {
        const meta = JSON.parse(payload.metadataJson);
        if (typeof meta.accuracyPct === 'number') {
          accuracyPct = meta.accuracyPct;
        }
      } catch {}
    }

    const queued = enqueueActivity({
      type: 'game_session',
      label: gameLabel,
      endpoint: '/api/game-sessions',
      method: 'POST',
      payload: finalPayload,
      accuracyPct,
      durationMs: payload.sessionDurationMs,
      difficultyLevel: payload.difficultyLevel || 'easy',
    });

    return {
      status: 'queued_offline',
      postedSessionId: queued.id,
      saveError: null,
      isOffline: true,
    };
  } catch (err: any) {
    return {
      status: 'queued_offline',
      postedSessionId: null,
      saveError: err?.message || 'Could not save session offline.',
      isOffline: true,
    };
  }
}
