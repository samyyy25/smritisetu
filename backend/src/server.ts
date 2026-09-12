import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import patientsRouter from './routes/patients';
import { DEMO_PATIENT_ID } from './config';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow local frontend during development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

import gameSessionsRouter from './routes/gameSessions';
import memoriesRouter from './routes/memories';
import remindersRouter from './routes/reminders';
import dashboardRouter from './routes/dashboard';
import placesRouter from './routes/places';

// Routes
app.use('/api', healthRouter);
app.use('/api', patientsRouter);
app.use('/api', gameSessionsRouter);
app.use('/api', memoriesRouter);
app.use('/api', remindersRouter);
app.use('/api', dashboardRouter);
app.use('/api', placesRouter);


// Root informational endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'SmritiSetu API Server',
    healthCheck: '/api/health',
    patients: '/api/patients',
    sessions: '/api/patients/:id/sessions',
    alerts: '/api/patients/:id/alerts',
    demoPatientId: DEMO_PATIENT_ID,
    version: '1.0.0',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmritiSetu API server listening on http://localhost:${PORT}`);
  console.log(`🩺 Health check:    http://localhost:${PORT}/api/health`);
  console.log(`👥 Patients API:    http://localhost:${PORT}/api/patients`);
  console.log(`🆔 Demo Patient ID: ${DEMO_PATIENT_ID}`);
});
