import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const patientId = '4b66adf7-99c8-49bb-b505-9daaadeddb95';
  const startedAt = new Date().toISOString();
  const completedAt = new Date(Date.now() + 15000).toISOString();

  const payload = {
    patientId,
    gameType: 'memory_match',
    responseTimeMs: 1450,
    sessionDurationMs: 15000,
    correct: true,
    hintUsed: true,
    answerChanges: 2,
    difficultyLevel: 'easy',
    startedAt,
    completedAt,
    timestamp: startedAt,
    metadataJson: JSON.stringify({
      totalAttempts: 6,
      correctMatches: 4,
      hintCount: 1,
      accuracyPct: 66.7,
      answerChanges: 2
    })
  };

  console.log('--- POSTING SESSION TO BACKEND ---');
  const res = await fetch('http://localhost:5000/api/game-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const createdSession = await res.json();
  console.log(JSON.stringify(createdSession, null, 2));

  console.log('\\n--- VERIFYING BY QUERYING DIRECTLY ---');
  const verifiedSession = await prisma.gameSession.findUnique({
    where: { id: createdSession.id }
  });
  console.log(JSON.stringify(verifiedSession, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
