import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

const DEFAULT_REMINDERS = [
  {
    id: 'rem_1',
    patientId: 'demo_patient_001',
    time: '8:00 AM',
    label: 'Morning Medicine & Chai',
    iconType: 'breakfast',
    completed: true,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_2',
    patientId: 'demo_patient_001',
    time: '11:00 AM',
    label: 'Drink Water & Hydrate',
    iconType: 'sun',
    completed: true,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_3',
    patientId: 'demo_patient_001',
    time: '1:30 PM',
    label: 'Afternoon Lunch & Rest',
    iconType: 'lunch',
    completed: false,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_4',
    patientId: 'demo_patient_001',
    time: '5:00 PM',
    label: 'Evening Walk in Garden',
    iconType: 'walk',
    completed: false,
    date: new Date().toISOString(),
  },
  {
    id: 'rem_5',
    patientId: 'demo_patient_001',
    time: '8:30 PM',
    label: 'Night Medicine with Warm Milk',
    iconType: 'medicine',
    completed: false,
    date: new Date().toISOString(),
  },
];

let inMemoryReminders = [...DEFAULT_REMINDERS];

/**
 * GET /api/patients/:id/reminders
 * Fetch all reminders for a specific patient, ordered by time.
 */
router.get('/patients/:id/reminders', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const reminders = await (prisma as any).reminder.findMany({
      where: { patientId: id },
      orderBy: { time: 'asc' },
    });
    if (reminders && reminders.length > 0) {
      res.json(reminders);
      return;
    }
    res.json(inMemoryReminders);
  } catch (err) {
    console.warn(`[GET /api/patients/${id}/reminders] Database unreachable, serving fallback reminders:`, (err as any)?.message);
    res.json(inMemoryReminders);
  }
});

/**
 * PATCH /api/reminders/:id
 * Toggle or update the completed state of a reminder.
 */
router.patch('/reminders/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const existing = await (prisma as any).reminder.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    const updated = await (prisma as any).reminder.update({
      where: { id },
      data: {
        completed: completed !== undefined ? completed : !existing.completed,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(`[PATCH /api/reminders/${id}] Error:`, err);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

/**
 * POST /api/patients/:id/reminders
 * Create a new reminder for a patient.
 */
router.post('/patients/:id/reminders', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { time, label, iconType, completed } = req.body;

  if (!time || !label) {
    res.status(400).json({ error: 'Missing required fields: time, label' });
    return;
  }

  try {
    const newReminder = await (prisma as any).reminder.create({
      data: {
        patientId: id,
        time,
        label,
        iconType: iconType || 'breakfast',
        completed: completed || false,
      },
    });

    res.status(201).json(newReminder);
  } catch (err) {
    console.error(`[POST /api/patients/${id}/reminders] Error:`, err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

export default router;
