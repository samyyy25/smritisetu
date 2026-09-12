# SmritiSetu (स्मृति सेतु) — Memory Bridge & Assistive Cognitive Care

SmritiSetu is a full-stack platform designed to preserve memories, reinforce daily routines, and provide cognitive health analytics for dementia and memory-impaired patients and their family caregivers.

---

## Project Structure

```
SmritiSetu/
├── /frontend       # React 18 (Vite) + Tailwind CSS + react-router-dom
│   ├── /src/pages/PatientApp.tsx         # Route "/" - Patient Memory App & live health monitor
│   ├── /src/pages/CaregiverDashboard.tsx # Route "/dashboard" - Caregiver metrics & alerts
│   └── /src/components/HealthStatusCard.tsx # Active probe for GET /api/health
├── /backend        # Node.js + Express API + PostgreSQL via Prisma
│   ├── /prisma/schema.prisma             # Full data model (Patient, Caregiver, MemoryLog, etc.)
│   ├── /prisma/migrations/...            # Working SQL migration for instant deploy
│   ├── /prisma/seed.ts                   # Seed script placeholder
│   ├── /src/routes/health.ts             # GET /api/health probing DB with SELECT 1
│   └── /src/server.ts                    # Express server on port 5000
└── /ai-engine      # Python data generation & scoring module
    ├── generate_data.py                  # Generates synthetic patient recall interaction logs
    ├── score_interaction.py              # Evaluates Cognitive Health Index (CHI) scores
    └── requirements.txt                  # Python dependencies
```

---

## Quick Start Guide

### 1. Database & Migrations

Ensure your PostgreSQL instance is running. Configure the connection URL in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smritisetu?schema=public"
```

Run migrations:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

*(Optional) Run the seed placeholder:*
```bash
npm run prisma:seed
```

### 2. Start the Backend API

```bash
cd backend
npm run dev
```
- **Server:** `http://localhost:5000`
- **Active Health Route:** `http://localhost:5000/api/health`
  *(Actively queries PostgreSQL using Prisma `$queryRaw` to verify the DB is alive)*

### 3. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
- **App URL:** `http://localhost:5173`
- **Patient App:** `http://localhost:5173/` (calls `/api/health` on initial load and displays live DB status)
- **Caregiver Dashboard:** `http://localhost:5173/dashboard`

### 4. Run AI Engine Scripts (Independently)

```bash
cd ai-engine
# Optional virtual environment:
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# 1. Generate synthetic memory logs
python generate_data.py

# 2. Run the cognitive scoring engine
python score_interaction.py
```
