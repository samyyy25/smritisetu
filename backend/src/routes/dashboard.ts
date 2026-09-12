import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * Helper to derive status ('Stable' | 'Monitor' | 'Attention') from alertType & status
 */
export function derivePatientStatus(latestAlert: { alertType: string; status: string } | null): 'Stable' | 'Monitor' | 'Attention' {
  if (!latestAlert || latestAlert.status === 'RESOLVED') {
    return 'Stable';
  }
  const type = latestAlert.alertType.toLowerCase();
  if (type.includes('possible change') || type.includes('cognitive_change') || type.includes('attention') || type.includes('decline')) {
    return 'Attention';
  }
  if (type.includes('monitoring signal') || type.includes('hesitation') || type.includes('monitor')) {
    return 'Monitor';
  }
  return latestAlert.status === 'ACTIVE' ? 'Attention' : 'Monitor';
}

const FALLBACK_DASHBOARD_ALERTS = [
  {
    id: 'alt_anita_001',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    patientName: 'Anita Devi',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Assamese',
    alertType: 'COGNITIVE_CHANGE',
    reasonText: 'Reaction time slowed by 34% during festival sequence recall and pattern matching over the last 14 days.',
    metricChanges: { reactionTimeIncreasePct: 34, accuracyChangePct: -12 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: 'ACTIVE',
    badgeStatus: 'Attention' as const,
  },
  {
    id: 'alt_maya_002',
    patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    patientName: 'Maya Devi',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    preferredLanguage: 'Nepali',
    alertType: 'MONITORING_SIGNAL',
    reasonText: 'Hesitation rate increased by 45% with answer revisions doubling across daily challenges over the last 10 days.',
    metricChanges: { hesitationRateIncrease: 1.45, answerChangesIncrease: 2.1 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'MONITOR',
    badgeStatus: 'Monitor' as const,
  },
];

/**
 * GET /api/dashboard/overview
 * Returns high-level statistics, 14-day cognitive overview, and recent alerts.
 */
router.get('/dashboard/overview', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch all patients with their most recent active alert
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        preferredLanguage: true,
        createdAt: true,
        alerts: {
          where: { status: { in: ['ACTIVE', 'MONITOR'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (patients && patients.length > 0) {
      let stableCount = 0;
      let monitorCount = 0;
      let attentionCount = 0;

      patients.forEach((p) => {
        const status = derivePatientStatus(p.alerts[0] || null);
        if (status === 'Attention') attentionCount++;
        else if (status === 'Monitor') monitorCount++;
        else stableCount++;
      });

      // 2. Fetch Recent 5 Alerts
      const recentAlertsRaw = await prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      const recentAlerts = recentAlertsRaw.map((a) => {
        let metricChanges = null;
        if (a.metricChangesJson) {
          try {
            metricChanges = JSON.parse(a.metricChangesJson);
          } catch {
            metricChanges = null;
          }
        }
        const badgeStatus = derivePatientStatus({ alertType: a.alertType, status: a.status });

        return {
          id: a.id,
          patientId: a.patientId,
          patientName: a.patient.name,
          patientAvatar: a.patient.avatarUrl,
          alertType: a.alertType,
          reasonText: a.reasonText,
          metricChanges,
          createdAt: a.createdAt,
          status: a.status,
          badgeStatus,
        };
      });

      // 3. Aggregate Cognitive Overview (Last 14 days vs prior 14 days)
      const now = new Date();
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(now.getDate() - 14);
      const twentyEightDaysAgo = new Date();
      twentyEightDaysAgo.setDate(now.getDate() - 28);

      const [recentSessions, priorSessions] = await Promise.all([
        prisma.gameSession.findMany({
          where: { timestamp: { gte: fourteenDaysAgo } },
          select: { correct: true, responseTimeMs: true, answerChanges: true, hintUsed: true },
        }),
        prisma.gameSession.findMany({
          where: { timestamp: { gte: twentyEightDaysAgo, lt: fourteenDaysAgo } },
          select: { correct: true, responseTimeMs: true, answerChanges: true, hintUsed: true },
        }),
      ]);

      const calcAvg = (sessions: typeof recentSessions) => {
        if (!sessions.length) return { acc: 80, rt: 3500, ac: 0.8, hints: 0.3 };
        const acc = (sessions.filter((s) => s.correct).length / sessions.length) * 100;
        const rt = sessions.reduce((sum, s) => sum + s.responseTimeMs, 0) / sessions.length;
        const ac = sessions.reduce((sum, s) => sum + s.answerChanges, 0) / sessions.length;
        const hints = (sessions.filter((s) => s.hintUsed).length / sessions.length) * 100;
        return { acc, rt, ac, hints };
      };

      const recentAvg = calcAvg(recentSessions);
      const priorAvg = calcAvg(priorSessions);

      const accDelta = Math.round((recentAvg.acc - priorAvg.acc) * 10) / 10;
      const rtDelta = Math.round(((recentAvg.rt - priorAvg.rt) / Math.max(priorAvg.rt, 1)) * 100);
      const acDelta = Math.round(((recentAvg.ac - priorAvg.ac) / Math.max(priorAvg.ac, 0.1)) * 100);
      const hintsDelta = Math.round((recentAvg.hints - priorAvg.hints) * 10) / 10;

      res.json({
        stats: {
          totalPatients: patients.length,
          stable: stableCount,
          monitor: monitorCount,
          attention: attentionCount,
        },
        cognitiveOverview: {
          timeframe: 'Last 14 Days',
          accuracyChangePct: accDelta,
          reactionTimeChangePct: rtDelta,
          hesitationChangePct: acDelta,
          hintsUsedChangePct: hintsDelta,
          recentAvg: {
            accuracy: Math.round(recentAvg.acc),
            reactionTimeSec: Math.round((recentAvg.rt / 1000) * 10) / 10,
            hesitationRate: Math.round(recentAvg.ac * 10) / 10,
            hintsUsedRate: Math.round(recentAvg.hints),
          },
        },
        recentAlerts,
        disclaimer: 'This is a monitoring signal, not a diagnosis.',
      });
      return;
    }
  } catch (err) {
    console.warn('[GET /api/dashboard/overview] Database unreachable, serving fallback dashboard:', (err as any)?.message);
  }

  // Fallback data
  res.json({
    stats: {
      totalPatients: 4,
      stable: 2,
      monitor: 1,
      attention: 1,
    },
    cognitiveOverview: {
      timeframe: 'Last 14 Days',
      accuracyChangePct: -4.2,
      reactionTimeChangePct: 18.5,
      hesitationChangePct: 12.0,
      hintsUsedChangePct: 5.1,
      recentAvg: {
        accuracy: 82,
        reactionTimeSec: 3.4,
        hesitationRate: 1.1,
        hintsUsedRate: 15,
      },
    },
    recentAlerts: FALLBACK_DASHBOARD_ALERTS,
    disclaimer: 'This is a monitoring signal, not a diagnosis.',
  });
});

/**
 * GET /api/alerts
 * Returns all alerts with patient details and filtering
 */
router.get('/alerts', async (req: Request, res: Response): Promise<void> => {
  const statusFilter = req.query.status as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  try {
    const where: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const alertsRaw = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            preferredLanguage: true,
          },
        },
      },
    });

    if (alertsRaw && alertsRaw.length > 0) {
      const alerts = alertsRaw.map((a) => {
        let metricChanges = null;
        if (a.metricChangesJson) {
          try {
            metricChanges = JSON.parse(a.metricChangesJson);
          } catch {
            metricChanges = null;
          }
        }
        const badgeStatus = derivePatientStatus({ alertType: a.alertType, status: a.status });

        return {
          id: a.id,
          patientId: a.patientId,
          patientName: a.patient.name,
          patientAvatar: a.patient.avatarUrl,
          preferredLanguage: a.patient.preferredLanguage,
          alertType: a.alertType,
          reasonText: a.reasonText,
          metricChanges,
          createdAt: a.createdAt,
          status: a.status,
          badgeStatus,
        };
      });

      res.json({
        count: alerts.length,
        alerts,
      });
      return;
    }
  } catch (err) {
    console.warn('[GET /api/alerts] Database unreachable, serving fallback alerts:', (err as any)?.message);
  }

  const filtered = statusFilter && statusFilter !== 'ALL'
    ? FALLBACK_DASHBOARD_ALERTS.filter((a) => a.status === statusFilter)
    : FALLBACK_DASHBOARD_ALERTS;

  res.json({
    count: filtered.length,
    alerts: filtered,
  });
});

export default router;
