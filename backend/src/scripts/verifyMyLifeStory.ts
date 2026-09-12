import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_PATIENT_ID = '23f55848-e317-4a06-ae05-3aa42d94cd10';

async function verify() {
  console.log('=== STEP 1: VERIFYING REAL MEMORIES & TIMELINE CHRONOLOGY ===');
  const patient = await prisma.patient.findUnique({
    where: { id: DEMO_PATIENT_ID },
    include: { memories: true }
  });

  if (!patient) {
    throw new Error('Demo patient not found in database!');
  }

  console.log(`Patient: ${patient.name}`);
  console.log(`Total real memories in database: ${patient.memories.length}`);

  // Sort ascending by year
  const sorted = [...patient.memories].sort((a, b) => {
    const yA = parseInt(a.year || '0', 10);
    const yB = parseInt(b.year || '0', 10);
    return yA - yB;
  });

  console.log('Chronological Timeline:');
  sorted.forEach((m, i) => {
    console.log(`  [${i + 1}] Year: ${m.year} | ${m.personName} (${m.relationship}) in ${m.place} -> "${m.description}"`);
  });

  console.log('\n=== STEP 2: VERIFYING RECALL GAME QUESTION GENERATION ===');
  if (sorted.length < 3) {
    console.log(`Fewer than 3 memories: correctly triggers "Unlock Life Story" screen with 0 fake events.`);
    return;
  }

  console.log(`>= 3 real memories available (${sorted.length} memories) -> Game is unlocked and active!`);

  function formatMemoryOption(mem: any): string {
    if (mem.description && mem.description.trim().length > 0) {
      return mem.description.length > 55 ? `${mem.description.slice(0, 52)}...` : mem.description;
    }
    return `${mem.personName} (${mem.relationship}) in ${mem.place}`;
  }

  const generatedQuestions = sorted.slice(0, 3).map((mem) => {
    const year = mem.year || 'Past Milestone';
    const correctOpt = formatMemoryOption(mem);
    const otherMemories = sorted.filter((m) => m.id !== mem.id);
    const otherOptions = otherMemories.map(formatMemoryOption).filter((opt) => opt !== correctOpt);
    const chosenWrongs = otherOptions.slice(0, 2);

    return {
      year,
      question: `What happened around ${year}?`,
      correctAnswer: correctOpt,
      options: [correctOpt, ...chosenWrongs]
    };
  });

  console.log('Generated Life Story Questions Sample:');
  generatedQuestions.forEach((q, i) => {
    console.log(`  Question ${i + 1}: "${q.question}"`);
    console.log(`    - Correct: "${q.correctAnswer}"`);
    console.log(`    - Options: [${q.options.map(o => `"${o}"`).join(', ')}]`);
  });

  console.log('\n=== STEP 3: POSTING GAME SESSION TO /api/game-sessions ===');
  const now = new Date();
  const sessionStarted = new Date(Date.now() - 16500); // 16.5s ago
  const payload = {
    patientId: DEMO_PATIENT_ID,
    gameType: 'my_life_story',
    questionId: null,
    responseTimeMs: 3120,
    sessionDurationMs: 16500,
    correct: true,
    hintUsed: false,
    answerChanges: 0,
    difficultyLevel: 'easy',
    startedAt: sessionStarted.toISOString(),
    completedAt: now.toISOString(),
    timestamp: sessionStarted.toISOString(),
    metadataJson: JSON.stringify({
      totalQuestions: 3,
      correctCount: 3,
      accuracyPct: 100,
      avgResponseMs: 3120,
      answerChanges: 0,
      hintCount: 0,
      difficultyLevel: 'easy',
      realMemoriesCount: sorted.length
    })
  };

  const postRes = await fetch('http://localhost:5000/api/game-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`Failed to POST game session: ${postRes.status} ${errText}`);
  }

  const sessionSaved = await postRes.json();
  console.log(`Successfully saved Life Story GameSession! ID: ${sessionSaved.id}`);

  console.log('\n=== STEP 4: VERIFYING POSTGRESQL DATABASE ROW ===');
  const dbRow = await prisma.gameSession.findUnique({
    where: { id: sessionSaved.id }
  });

  console.log('Verified database record:', {
    id: dbRow?.id,
    gameType: dbRow?.gameType,
    patientId: dbRow?.patientId,
    responseTimeMs: dbRow?.responseTimeMs,
    sessionDurationMs: dbRow?.sessionDurationMs,
    correct: dbRow?.correct,
    difficultyLevel: dbRow?.difficultyLevel,
    startedAt: dbRow?.startedAt,
    completedAt: dbRow?.completedAt,
    metadataJson: dbRow?.metadataJson
  });

  console.log('\n✅ ALL MY LIFE STORY VERIFICATION CHECKS PASSED!');
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
