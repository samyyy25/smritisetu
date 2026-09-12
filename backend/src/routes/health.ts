import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/health', async (_req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    // Perform an active probe to verify PostgreSQL database connectivity
    await prisma.$queryRaw`SELECT 1 as alive`;
    const latencyMs = Date.now() - startTime;

    res.status(200).json({
      status: 'ok',
      service: 'SmritiSetu API',
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        latencyMs,
      },
      serverUptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('Database health check failed:', error?.message || error);

    res.status(503).json({
      status: 'error',
      service: 'SmritiSetu API',
      database: {
        status: 'disconnected',
        type: 'PostgreSQL',
        latencyMs,
        error: error?.message || 'Database connection probe failed',
      },
      serverUptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
