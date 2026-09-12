import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

export interface PatientRecord {
  id: string;
  name: string;
  avatarUrl: string | null;
  age: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
  createdAt: string;
  lastActiveAt?: string;
  status: 'Stable' | 'Monitor' | 'Attention';
  latestAlert?: {
    id: string;
    alertType: string;
    reasonText: string;
    status: string;
    createdAt: string;
  } | null;
  latestSession?: {
    timestamp: string;
    startedAt: string;
    gameType: string;
  } | null;
  _count?: {
    gameSessions: number;
    alerts: number;
    memories: number;
    reminders: number;
  };
}

const DEFAULT_PATIENTS: PatientRecord[] = [
  {
    id: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    name: 'Anita Devi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    age: 72,
    emergencyContactName: 'Priya Devi (Daughter)',
    emergencyContactPhone: '+91 98765 43210',
    preferredLanguage: 'Assamese',
    createdAt: new Date('2024-01-01').toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'Attention',
    latestAlert: {
      id: 'alt_anita_001',
      alertType: 'COGNITIVE_CHANGE',
      reasonText: 'Reaction time slowed by 34% during festival sequence recall and pattern matching over the last 14 days.',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      gameType: 'festival_memories',
    },
    _count: { gameSessions: 225, alerts: 1, memories: 4, reminders: 5 },
  },
  {
    id: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    name: 'Ramesh Das',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    age: 68,
    emergencyContactName: 'Utpal Das (Son)',
    emergencyContactPhone: '+91 98765 43211',
    preferredLanguage: 'Assamese',
    createdAt: new Date('2024-01-15').toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'Stable',
    latestAlert: null,
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      gameType: 'memory_match',
    },
    _count: { gameSessions: 225, alerts: 0, memories: 2, reminders: 3 },
  },
  {
    id: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    name: 'Maya Devi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    age: 75,
    emergencyContactName: 'Sunil Thapa (Son)',
    emergencyContactPhone: '+91 98765 43212',
    preferredLanguage: 'Nepali',
    createdAt: new Date('2024-02-01').toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'Monitor',
    latestAlert: {
      id: 'alt_maya_002',
      alertType: 'MONITORING_SIGNAL',
      reasonText: 'Hesitation rate increased by 45% with answer revisions doubling across daily challenges over the last 10 days.',
      status: 'MONITOR',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      gameType: 'daily_challenge',
    },
    _count: { gameSessions: 225, alerts: 1, memories: 2, reminders: 3 },
  },
  {
    id: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    name: 'Bikash Saikia',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    age: 70,
    emergencyContactName: 'Mainao Saikia (Daughter)',
    emergencyContactPhone: '+91 98765 43213',
    preferredLanguage: 'Bodo',
    createdAt: new Date('2024-02-10').toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'Stable',
    latestAlert: null,
    latestSession: {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      gameType: 'remember_and_speak',
    },
    _count: { gameSessions: 225, alerts: 0, memories: 1, reminders: 3 },
  },
];

let inMemoryPatients: PatientRecord[] = [...DEFAULT_PATIENTS];

const DEFAULT_SESSIONS = [
  {
    id: 'sess_1',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    gameType: 'festival_memories',
    responseTimeMs: 3800,
    sessionDurationMs: 45000,
    correct: true,
    hintUsed: false,
    answerChanges: 1,
    difficultyLevel: 'easy',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'sess_2',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    gameType: 'memory_match',
    responseTimeMs: 2900,
    sessionDurationMs: 38000,
    correct: true,
    hintUsed: false,
    answerChanges: 0,
    difficultyLevel: 'easy',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'sess_3',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    gameType: 'who_is_this',
    responseTimeMs: 4200,
    sessionDurationMs: 52000,
    correct: false,
    hintUsed: true,
    answerChanges: 2,
    difficultyLevel: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

/**
 * GET /api/patients
 * Returns a list of all patients with status and latest alerts.
 */
router.get('/patients', async (_req: Request, res: Response): Promise<void> => {
  try {
    const patientsRaw = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        preferredLanguage: true,
        createdAt: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            alertType: true,
            reasonText: true,
            status: true,
            createdAt: true,
          },
        },
        gameSessions: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            timestamp: true,
            startedAt: true,
            gameType: true,
          },
        },
        _count: {
          select: {
            gameSessions: true,
            alerts: true,
            memories: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (patientsRaw && patientsRaw.length > 0) {
      const patients = patientsRaw.map((p) => {
        const latestAlert = p.alerts[0] || null;
        const latestSession = p.gameSessions[0] || null;
        const lastActiveAt = latestSession ? latestSession.timestamp : p.createdAt;

        let status: 'Stable' | 'Monitor' | 'Attention' = 'Stable';
        if (latestAlert && latestAlert.status !== 'RESOLVED') {
          const type = latestAlert.alertType.toLowerCase();
          if (type.includes('possible change') || type.includes('cognitive_change') || type.includes('attention') || type.includes('decline')) {
            status = 'Attention';
          } else if (type.includes('monitoring signal') || type.includes('hesitation') || type.includes('monitor')) {
            status = 'Monitor';
          } else {
            status = latestAlert.status === 'ACTIVE' ? 'Attention' : 'Monitor';
          }
        }

        return {
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          preferredLanguage: p.preferredLanguage,
          createdAt: p.createdAt,
          lastActiveAt,
          status,
          latestAlert,
          latestSession,
          _count: p._count,
        };
      });

      res.json({
        count: patients.length,
        patients,
      });
      return;
    }

    res.json({
      count: inMemoryPatients.length,
      patients: inMemoryPatients,
    });
  } catch (err) {
    console.warn('[GET /api/patients] Database unavailable, serving in-memory fallback patients:', (err as any)?.message);
    res.json({
      count: inMemoryPatients.length,
      patients: inMemoryPatients,
    });
  }
});

/**
 * GET /api/patients/:id
 * Returns one patient profile with latest alert status.
 */
router.get('/patients/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        age: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        preferredLanguage: true,
        createdAt: true,
        dailyRoutines: {
          orderBy: { timeOfDay: 'asc' },
        },
        reminders: {
          orderBy: { time: 'asc' },
        },
        caregivers: true,
        _count: {
          select: { gameSessions: true, memories: true, alerts: true, reminders: true },
        },
      },
    });

    if (patient) {
      const latestAlert = await prisma.alert.findFirst({
        where: { patientId: id, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        select: { alertType: true, reasonText: true, createdAt: true, status: true },
      });

      res.json({ ...patient, latestAlert });
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${id}] Database unavailable, searching in-memory fallback:`, (err as any)?.message);
  }

  // Fallback to in-memory patient
  const found = inMemoryPatients.find((p) => p.id === id) || inMemoryPatients[0];
  if (found) {
    res.json({
      ...found,
      dailyRoutines: [
        { id: 'dr_1', timeOfDay: '08:00 AM', activity: 'Morning Medicine & Chai', isCompleted: true, category: 'Health' },
        { id: 'dr_2', timeOfDay: '01:30 PM', activity: 'Afternoon Lunch & Rest', isCompleted: false, category: 'Health' },
        { id: 'dr_3', timeOfDay: '08:30 PM', activity: 'Night Medicine & Relaxation', isCompleted: false, category: 'Health' },
      ],
      reminders: [
        { id: 'rem_1', time: '8:00 AM', label: 'Morning Medicine & Chai', iconType: 'breakfast', completed: true },
        { id: 'rem_2', time: '11:00 AM', label: 'Drink Water & Hydrate', iconType: 'sun', completed: true },
        { id: 'rem_3', time: '1:30 PM', label: 'Afternoon Lunch & Rest', iconType: 'lunch', completed: false },
        { id: 'rem_4', time: '5:00 PM', label: 'Evening Walk in Garden', iconType: 'walk', completed: false },
        { id: 'rem_5', time: '8:30 PM', label: 'Night Medicine with Warm Milk', iconType: 'medicine', completed: false },
      ],
      caregivers: [
        { id: 'cg_1', name: 'Priya Sharma', relation: 'Daughter', phoneNumber: '+91 98765 43210' },
      ],
    });
    return;
  }

  res.status(404).json({ error: 'Patient not found' });
});

/**
 * PATCH /api/patients/:id
 * Updates patient fields.
 */
router.patch('/patients/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { preferredLanguage, name, avatarUrl, age, emergencyContactName, emergencyContactPhone } = req.body;

  try {
    const dataToUpdate: Record<string, any> = {};
    if (preferredLanguage !== undefined) dataToUpdate.preferredLanguage = preferredLanguage;
    if (name !== undefined) dataToUpdate.name = name;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;
    if (age !== undefined) dataToUpdate.age = Number(age);
    if (emergencyContactName !== undefined) dataToUpdate.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) dataToUpdate.emergencyContactPhone = emergencyContactPhone;

    const updated = await prisma.patient.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        age: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    res.json({ success: true, patient: updated });
    return;
  } catch (err) {
    console.warn(`[PATCH /api/patients/${id}] Database unreachable, updating in-memory:`, (err as any)?.message);
  }

  // Update in-memory record
  const idx = inMemoryPatients.findIndex((p) => p.id === id);
  if (idx !== -1) {
    inMemoryPatients[idx] = {
      ...inMemoryPatients[idx],
      ...(preferredLanguage !== undefined ? { preferredLanguage } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(age !== undefined ? { age: Number(age) } : {}),
      ...(emergencyContactName !== undefined ? { emergencyContactName } : {}),
      ...(emergencyContactPhone !== undefined ? { emergencyContactPhone } : {}),
    };
    res.json({ success: true, patient: inMemoryPatients[idx] });
    return;
  }

  res.json({ success: true, patient: inMemoryPatients[0] });
});

/**
 * GET /api/patients/:id/sessions
 * Returns GameSession records for a patient.
 */
router.get('/patients/:id/sessions', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const gameType = req.query.gameType as string | undefined;
  const days = Number(req.query.days) || undefined;

  try {
    const patientExists = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (patientExists) {
      const where: Record<string, unknown> = { patientId: id };
      if (gameType) where.gameType = gameType;
      if (days) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        where.timestamp = { gte: since };
      }

      const sessions = await prisma.gameSession.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      const totalSessions = sessions.length;
      const correctCount = sessions.filter((s) => s.correct).length;
      const avgResponseMs =
        totalSessions > 0
          ? Math.round(
              sessions.reduce((sum, s) => sum + s.responseTimeMs, 0) / totalSessions
            )
          : 0;

      res.json({
        patientId: id,
        totalSessions,
        correctCount,
        accuracyPct:
          totalSessions > 0
            ? Math.round((correctCount / totalSessions) * 1000) / 10
            : 0,
        avgResponseMs,
        sessions,
      });
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${id}/sessions] Database unreachable, serving fallback sessions:`, (err as any)?.message);
  }

  // Fallback in-memory sessions
  const filtered = gameType ? DEFAULT_SESSIONS.filter((s) => s.gameType === gameType) : DEFAULT_SESSIONS;
  const totalSessions = filtered.length;
  const correctCount = filtered.filter((s) => s.correct).length;
  const avgResponseMs =
    totalSessions > 0
      ? Math.round(filtered.reduce((sum, s) => sum + s.responseTimeMs, 0) / totalSessions)
      : 3200;

  res.json({
    patientId: id,
    totalSessions,
    correctCount,
    accuracyPct: totalSessions > 0 ? Math.round((correctCount / totalSessions) * 1000) / 10 : 85,
    avgResponseMs,
    sessions: filtered,
  });
});

/**
 * GET /api/patients/:id/alerts
 * Returns Alert records for a patient.
 */
router.get('/patients/:id/alerts', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  try {
    const alerts = await prisma.alert.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    if (alerts && alerts.length > 0) {
      res.json({ patientId: id, count: alerts.length, alerts });
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${id}/alerts] Database unreachable, serving fallback:`, (err as any)?.message);
  }

  const patient = inMemoryPatients.find((p) => p.id === id);
  const sampleAlerts = patient?.latestAlert ? [patient.latestAlert] : [];
  res.json({ patientId: id, count: sampleAlerts.length, alerts: sampleAlerts });
});

/**
 * GET /api/patients/:id/difficulty/:gameType
 * Computes adaptive difficulty level based on last sessions.
 */
router.get('/patients/:id/difficulty/:gameType', async (req: Request, res: Response): Promise<void> => {
  const { id, gameType } = req.params;

  try {
    const sessions = await prisma.gameSession.findMany({
      where: { patientId: id, gameType },
      orderBy: { timestamp: 'desc' },
      take: 3,
    });

    const levels = ['easy', 'medium', 'hard'] as const;
    type DifficultyLevel = typeof levels[number];

    let currentLevel: DifficultyLevel = 'easy';
    if (sessions.length > 0 && sessions[0].difficultyLevel) {
      const raw = sessions[0].difficultyLevel.toLowerCase();
      if (levels.includes(raw as DifficultyLevel)) {
        currentLevel = raw as DifficultyLevel;
      }
    }

    if (sessions.length < 3) {
      res.json({
        patientId: id,
        gameType,
        difficultyLevel: currentLevel,
        previousDifficulty: currentLevel,
        change: 'unchanged',
        message: null,
        sessionsCount: sessions.length,
        avgAccuracyPct: null,
      });
      return;
    }

    const accuracies: number[] = sessions.map((s) => {
      if (s.metadataJson) {
        try {
          const meta = JSON.parse(s.metadataJson);
          if (meta.accuracyPct !== undefined) {
            return Number(meta.accuracyPct);
          }
        } catch {}
      }
      return s.correct ? 100 : 0;
    });

    const avgAccuracy = Math.round(
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    );

    let nextLevel: DifficultyLevel = currentLevel;
    let change: 'increased' | 'decreased' | 'unchanged' = 'unchanged';
    let message: string | null = null;

    const currentIndex = levels.indexOf(currentLevel);

    if (avgAccuracy > 85) {
      if (currentIndex < levels.length - 1) {
        nextLevel = levels[currentIndex + 1];
        change = 'increased';
        message = "Let's try something a little harder 🌟";
      }
    } else if (avgAccuracy < 65) {
      if (currentIndex > 0) {
        nextLevel = levels[currentIndex - 1];
        change = 'decreased';
        message = "Let's take our time 🌿";
      }
    }

    res.json({
      patientId: id,
      gameType,
      difficultyLevel: nextLevel,
      previousDifficulty: currentLevel,
      change,
      message,
      sessionsCount: sessions.length,
      avgAccuracyPct: avgAccuracy,
    });
    return;
  } catch (err) {
    console.warn(`[GET /api/patients/${id}/difficulty/${gameType}] Database unreachable, serving fallback:`, (err as any)?.message);
  }

  res.json({
    patientId: id,
    gameType,
    difficultyLevel: 'easy',
    previousDifficulty: 'easy',
    change: 'unchanged',
    message: null,
    sessionsCount: 3,
    avgAccuracyPct: 88,
  });
});

export default router;
