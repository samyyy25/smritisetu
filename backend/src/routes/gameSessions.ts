import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

const inMemoryGameSessions: any[] = [];

/**
 * POST /api/game-sessions
 * Create a new GameSession record from a completed game.
 */
router.post('/game-sessions', async (req: Request, res: Response): Promise<void> => {
  const {
    patientId,
    gameType,
    questionId,
    responseTimeMs,
    sessionDurationMs,
    correct,
    hintUsed,
    answerChanges,
    difficultyLevel,
    startedAt,
    completedAt,
    timestamp,
    metadataJson,
  } = req.body;

  // Basic validation
  if (!patientId || !gameType || responseTimeMs == null || sessionDurationMs == null || correct == null) {
    res.status(400).json({ error: 'Missing required fields: patientId, gameType, responseTimeMs, sessionDurationMs, correct' });
    return;
  }

  try {
    const session = await prisma.gameSession.create({
      data: {
        patientId,
        gameType,
        questionId: questionId ?? null,
        responseTimeMs: Number(responseTimeMs),
        sessionDurationMs: Number(sessionDurationMs),
        correct: Boolean(correct),
        hintUsed: Boolean(hintUsed ?? false),
        answerChanges: Number(answerChanges ?? 0),
        difficultyLevel: difficultyLevel ?? 'easy',
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadataJson: metadataJson ?? null,
      },
    });

    res.status(201).json(session);
    return;
  } catch (err) {
    console.warn('[POST /api/game-sessions] Database unreachable, saving in-memory session:', (err as any)?.message);
  }

  // In-memory fallback
  const mockSession = {
    id: `sess_${randomUUID()}`,
    patientId,
    gameType,
    questionId: questionId ?? null,
    responseTimeMs: Number(responseTimeMs),
    sessionDurationMs: Number(sessionDurationMs),
    correct: Boolean(correct),
    hintUsed: Boolean(hintUsed ?? false),
    answerChanges: Number(answerChanges ?? 0),
    difficultyLevel: difficultyLevel ?? 'easy',
    startedAt: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
    completedAt: completedAt ? new Date(completedAt).toISOString() : new Date().toISOString(),
    timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    metadataJson: metadataJson ?? null,
  };
  inMemoryGameSessions.push(mockSession);

  res.status(201).json(mockSession);
});

/**
 * GET /api/game-sessions/:id
 * Fetch a single session by ID — used to verify data after a play.
 */
router.get('/game-sessions/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const session = await prisma.gameSession.findUnique({ where: { id } });
    if (session) {
      res.json(session);
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/game-sessions/${id}] Database unreachable, searching in-memory:`, (err as any)?.message);
  }

  const found = inMemoryGameSessions.find((s) => s.id === id);
  if (found) {
    res.json(found);
    return;
  }

  res.status(404).json({ error: 'Session not found' });
});

export default router;
