import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DEMO_PATIENTS = [
  {
    id: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    name: 'Anita Devi',
    age: 72,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    emergencyContactName: 'Priya Devi (Daughter)',
    emergencyContactPhone: '+91 98765 43210',
    preferredLanguage: 'Assamese',
    syntheticProfile: 'declining',
  },
  {
    id: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    name: 'Ramesh Das',
    age: 68,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    emergencyContactName: 'Utpal Das (Son)',
    emergencyContactPhone: '+91 98765 43211',
    preferredLanguage: 'Assamese',
    syntheticProfile: 'stable',
  },
  {
    id: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    name: 'Maya Devi',
    age: 75,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    emergencyContactName: 'Sunil Thapa (Son)',
    emergencyContactPhone: '+91 98765 43212',
    preferredLanguage: 'Nepali',
    syntheticProfile: 'declining',
  },
  {
    id: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    name: 'Bikash Saikia',
    age: 70,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    emergencyContactName: 'Mainao Saikia (Daughter)',
    emergencyContactPhone: '+91 98765 43213',
    preferredLanguage: 'Bodo',
    syntheticProfile: 'stable',
  },
];

const GAME_TYPES = [
  'memory_match',
  'who_is_this',
  'festival_memories',
  'remember_and_speak',
  'daily_challenge',
  'life_story',
];

/**
 * Generates 90 days of realistic game sessions per patient
 */
function generateGameSessions(patientId: string, profile: string) {
  const sessions = [];
  const now = new Date();

  for (let day = 89; day >= 0; day--) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - day);

    // 2 to 3 sessions per day
    const sessionsToday = 2 + (day % 2);

    for (let s = 0; s < sessionsToday; s++) {
      const gameType = GAME_TYPES[(day * 3 + s) % GAME_TYPES.length];
      const hour = 9 + s * 4 + (day % 3);
      sessionDate.setHours(hour, (s * 23) % 60, (day * 17) % 60, 0);

      let correct = true;
      let responseTimeMs = 2800;
      let answerChanges = 0;
      let hintUsed = false;

      if (profile === 'stable') {
        // Flat trend + normal slight variation
        const randomFactor = Math.sin(day * 0.5 + s) * 0.5 + 0.5;
        correct = Math.random() < 0.85;
        responseTimeMs = Math.round(2500 + randomFactor * 800 + Math.random() * 300);
        answerChanges = Math.random() < 0.15 ? 1 : 0;
        hintUsed = Math.random() < 0.12;
      } else if (patientId === '23f55848-e317-4a06-ae05-3aa42d94cd10') {
        // Anita Devi: Reaction time & accuracy drift over the last 30 days
        const progress = (90 - day) / 90; // 0 (old) -> 1 (today)
        const accuracyProb = Math.max(0.55, 0.88 - progress * 0.28);
        correct = Math.random() < accuracyProb;
        const driftMs = progress * 1500;
        responseTimeMs = Math.round(2600 + driftMs + Math.random() * 400);
        answerChanges = Math.random() < (0.1 + progress * 0.4) ? 1 : 0;
        hintUsed = Math.random() < (0.1 + progress * 0.3);
      } else {
        // Maya Devi: Hesitation & answer revisions drift over the last 30 days
        const progress = (90 - day) / 90;
        const accuracyProb = Math.max(0.68, 0.85 - progress * 0.15);
        correct = Math.random() < accuracyProb;
        const driftMs = progress * 900;
        responseTimeMs = Math.round(2800 + driftMs + Math.random() * 400);
        // Noticeable spike in answer changes
        answerChanges = Math.random() < (0.2 + progress * 0.65) ? (Math.random() < 0.4 ? 2 : 1) : 0;
        hintUsed = Math.random() < (0.15 + progress * 0.35);
      }

      const durationMs = Math.round(responseTimeMs * (3 + Math.random() * 3));

      sessions.push({
        patientId,
        gameType,
        responseTimeMs,
        sessionDurationMs: durationMs,
        correct,
        hintUsed,
        answerChanges,
        difficultyLevel: correct ? 'medium' : 'easy',
        startedAt: new Date(sessionDate.getTime() - durationMs),
        completedAt: sessionDate,
        timestamp: sessionDate,
        metadataJson: JSON.stringify({
          accuracyPct: correct ? 100 : 0,
          difficulty: 'adaptive',
          hesitationCount: answerChanges,
        }),
      });
    }
  }

  return sessions;
}

async function main() {
  console.log('🌱 Starting SmritiSetu 4-Patient Database Seeding...');

  // 1. Clean existing records idempotently
  console.log('🧹 Cleaning existing tables...');
  await prisma.locationLog.deleteMany({});
  await prisma.savedPlace.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.dailyRoutine.deleteMany({});
  await prisma.caregiver.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.memory.deleteMany({});
  await prisma.gameSession.deleteMany({});
  await prisma.patient.deleteMany({});

  console.log('👥 Seeding 4 Demo Patients...');

  // 2. Insert the 4 Patients
  for (const p of DEMO_PATIENTS) {
    const patient = await prisma.patient.create({
      data: {
        id: p.id,
        name: p.name,
        age: p.age,
        avatarUrl: p.avatarUrl,
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone,
        preferredLanguage: p.preferredLanguage,
        syntheticProfile: p.syntheticProfile,
        createdAt: new Date('2024-01-01'),
      },
    });
    console.log(`  ✓ Patient created: ${patient.name} (${patient.id}) [${p.syntheticProfile}]`);

    // 3. Generate and batch insert 90 days of Game Sessions
    const sessions = generateGameSessions(p.id, p.syntheticProfile);
    await prisma.gameSession.createMany({
      data: sessions,
    });
    console.log(`    ↳ Inserted ${sessions.length} game sessions spanning 90 days.`);
  }

  // 4. Seed Alerts
  console.log('🚨 Seeding specific alerts...');
  
  // Anita Devi - Attention Alert (Reaction time & festival recall accuracy drop)
  await prisma.alert.create({
    data: {
      id: 'alt_anita_001',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      alertType: 'COGNITIVE_CHANGE',
      reasonText: 'Reaction time slowed by 34% during festival sequence recall and pattern matching over the last 14 days.',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      metricChangesJson: JSON.stringify({
        reactionTimeIncreasePct: 34,
        accuracyChangePct: -12,
        timeframe: 'Last 14 Days',
      }),
    },
  });

  // Maya Devi - Monitor Alert (Hesitation-driven & answer revision surge)
  await prisma.alert.create({
    data: {
      id: 'alt_maya_002',
      patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
      alertType: 'MONITORING_SIGNAL',
      reasonText: 'Hesitation rate increased by 45% with answer revisions doubling across daily challenges over the last 10 days.',
      status: 'MONITOR',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      metricChangesJson: JSON.stringify({
        hesitationRateIncrease: 1.45,
        answerChangesIncrease: 2.1,
        timeframe: 'Last 10 Days',
      }),
    },
  });

  // 5. Seed Memories
  console.log('📸 Seeding real memories for patients...');

  // Anita Devi Memories (5 rich seeded memories including working videos)
  await prisma.memory.createMany({
    data: [
      {
        id: 'mem_anita_1',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Priya Sharma (Daughter)',
        relationship: 'Daughter',
        year: '2019',
        place: 'Guwahati, Assam',
        description: "Priya's convocation ceremony at Gauhati University. We wore traditional muga silk and celebrated with homemade pitha.",
        createdAt: new Date('2019-06-15'),
      },
      {
        id: 'mem_anita_2',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        photoUrl: 'https://images.unsplash.com/photo-1506863530036-1ef0d464f158?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Rohan Sharma (Grandson)',
        relationship: 'Grandson',
        year: '2022',
        place: 'Kaziranga National Park',
        description: 'Rohan holding my hand when we saw the one-horned rhino for the first time during our sunrise morning safari.',
        createdAt: new Date('2022-03-20'),
      },
      {
        id: 'mem_anita_3',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-40089-large.mp4',
        mediaType: 'video',
        personName: 'Family Bihu Nature Walk',
        relationship: 'Family',
        year: '2023',
        place: 'Ancestral Courtyard, Tezpur',
        description: 'Family springtime walk together playing the dhol and enjoying the fresh green tea garden breeze.',
        createdAt: new Date('2023-04-14'),
      },
      {
        id: 'mem_anita_4',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Late Dhiren Sharma (Husband)',
        relationship: 'Husband',
        year: '1976',
        place: 'Shillong, Meghalaya',
        description: 'Our honeymoon visit to Ward Lake and Elephant Falls during the spring cherry blossom season.',
        createdAt: new Date('1976-10-10'),
      },
      {
        id: 'mem_anita_5',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-elderly-woman-sitting-on-a-bench-and-smiling-41712-large.mp4',
        mediaType: 'video',
        personName: 'Garden Morning Sunshine Moments',
        relationship: 'Memories',
        year: '2024',
        place: 'Panbazar Garden, Guwahati',
        description: 'Sitting peacefully in the morning sun with sweet Assam chai watching the songbirds.',
        createdAt: new Date('2024-02-18'),
      },
    ],
  });

  // Ramesh Das Memories
  await prisma.memory.createMany({
    data: [
      {
        id: 'mem_ramesh_1',
        patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Utpal Das (Son)',
        relationship: 'Son',
        year: '2018',
        place: 'Jorhat, Assam',
        description: 'Utpal receiving his mechanical engineering degree with honors from Jorhat Engineering College.',
        createdAt: new Date('2018-07-22'),
      },
      {
        id: 'mem_ramesh_2',
        patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Ananya Das (Daughter-in-law)',
        relationship: 'Daughter-in-law',
        year: '2020',
        place: 'Guwahati, Assam',
        description: 'Welcoming Ananya into our home during the family reception ceremony.',
        createdAt: new Date('2020-11-12'),
      },
      {
        id: 'mem_ramesh_3',
        patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Tea Estate Retirement Farewell',
        relationship: 'Colleagues & Friends',
        year: '2021',
        place: 'Dibrugarh, Assam',
        description: 'Colleagues honoring 35 years of tea garden management with traditional Assamese gamusa and brass xorai.',
        createdAt: new Date('2021-03-31'),
      },
      {
        id: 'mem_ramesh_4',
        patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Aarav Das (Grandson)',
        relationship: 'Grandson',
        year: '2023',
        place: 'Silpukhuri, Guwahati',
        description: 'Aarav playing in the living room with his wooden train set.',
        createdAt: new Date('2023-08-10'),
      },
    ],
  });

  // Maya Devi Memories
  await prisma.memory.createMany({
    data: [
      {
        id: 'mem_maya_1',
        patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Sunil Thapa (Son)',
        relationship: 'Son',
        year: '2020',
        place: 'Guwahati, Assam',
        description: 'Sunil opening his first bakery and tea boutique in Ganeshguri.',
        createdAt: new Date('2020-02-14'),
      },
      {
        id: 'mem_maya_2',
        patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Pooja Thapa (Daughter)',
        relationship: 'Daughter',
        year: '2021',
        place: 'Shillong, Meghalaya',
        description: 'Pooja returning home for Dashain festival holidays.',
        createdAt: new Date('2021-10-15'),
      },
      {
        id: 'mem_maya_3',
        patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Dashain Festival Family Blessing',
        relationship: 'Family & Grandchildren',
        year: '2022',
        place: 'Shillong, Meghalaya',
        description: 'Putting red Tika and golden Jamara on grandchildren and blessing the whole family.',
        createdAt: new Date('2022-10-05'),
      },
      {
        id: 'mem_maya_4',
        patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Late Manbahadur Thapa (Husband)',
        relationship: 'Husband',
        year: '1980',
        place: 'Darjeeling',
        description: 'A quiet evening walking along Chowrasta overlooking the Kanchenjunga peaks.',
        createdAt: new Date('1980-05-12'),
      },
    ],
  });

  // Bikash Saikia Memories
  await prisma.memory.createMany({
    data: [
      {
        id: 'mem_bikash_1',
        patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Mainao Saikia (Daughter)',
        relationship: 'Daughter',
        year: '2019',
        place: 'Kokrajhar, Assam',
        description: 'Mainao dressed in traditional Dokhona during college annual day.',
        createdAt: new Date('2019-03-10'),
      },
      {
        id: 'mem_bikash_2',
        patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Bwisagu Spring Festival',
        relationship: 'Community Elders',
        year: '2021',
        place: 'Kokrajhar, Assam',
        description: 'Playing traditional kham and sifung flute with village elders to welcome the new year.',
        createdAt: new Date('2021-04-15'),
      },
      {
        id: 'mem_bikash_3',
        patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
        videoUrl: null,
        mediaType: 'photo',
        personName: 'Sanjoy Saikia (Son)',
        relationship: 'Son',
        year: '2022',
        place: 'Bongaigaon, Assam',
        description: 'Sanjoy visiting home with his new motorcycle.',
        createdAt: new Date('2022-09-18'),
      },
    ],
  });

  // 6. Seed Saved Places for Anita Devi
  console.log('📍 Seeding Saved Places for Anita Devi...');
  const homePlace = await prisma.savedPlace.create({
    data: {
      id: 'plc_anita_home',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      label: 'Home (Panbazar)',
      latitude: 26.1820,
      longitude: 91.7485,
      address: 'House #14, Hem Baruah Road, Panbazar, Guwahati, Assam 781001',
      category: 'Home',
      iconType: 'home',
    },
  });

  const daughterPlace = await prisma.savedPlace.create({
    data: {
      id: 'plc_anita_daughter',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      label: "Priya's House (Daughter)",
      latitude: 26.1510,
      longitude: 91.7725,
      address: 'Block B-4, Capital View Apartments, Dispur, Guwahati, Assam 781006',
      category: 'Family',
      iconType: 'heart',
    },
  });

  const mandirPlace = await prisma.savedPlace.create({
    data: {
      id: 'plc_anita_mandir',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      label: 'Community Mandir (Sukreswar)',
      latitude: 26.1802,
      longitude: 91.7430,
      address: 'Near Nehru Park, Sukreswar Temple Complex, MG Road, Guwahati',
      category: 'Worship',
      iconType: 'building',
    },
  });

  const shopPlace = await prisma.savedPlace.create({
    data: {
      id: 'plc_anita_shop',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      label: 'Usual Grocery Shop (Bora Brothers)',
      latitude: 26.1795,
      longitude: 91.7510,
      address: 'Shop #12, Panbazar Market Crossroad, Guwahati',
      category: 'Shop',
      iconType: 'shopping-bag',
    },
  });

  await prisma.savedPlace.create({
    data: {
      id: 'plc_anita_clinic',
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      label: 'Dr. Borah Senior Care Clinic & Pharmacy',
      latitude: 26.1840,
      longitude: 91.7450,
      address: 'Plot #8, Danish Road Corner, Panbazar, Guwahati',
      category: 'Clinic',
      iconType: 'activity',
    },
  });

  // Saved place for Ramesh Das as well
  await prisma.savedPlace.create({
    data: {
      id: 'plc_ramesh_home',
      patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
      label: 'Home (Silpukhuri)',
      latitude: 26.1870,
      longitude: 91.7650,
      address: 'Lane 3, Silpukhuri, Guwahati, Assam 781003',
      category: 'Home',
      iconType: 'home',
    },
  });

  // 7. Seed Location Logs for Anita Devi
  console.log('🗺️ Seeding Location Logs for Anita Devi...');
  await prisma.locationLog.createMany({
    data: [
      {
        id: 'loc_anita_1',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        savedPlaceId: homePlace.id,
        latitude: 26.1820,
        longitude: 91.7485,
        timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
      },
      {
        id: 'loc_anita_2',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        savedPlaceId: shopPlace.id,
        latitude: 26.1795,
        longitude: 91.7510,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
      {
        id: 'loc_anita_3',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        savedPlaceId: mandirPlace.id,
        latitude: 26.1802,
        longitude: 91.7430,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        id: 'loc_anita_4',
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        savedPlaceId: daughterPlace.id,
        latitude: 26.1510,
        longitude: 91.7725,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // Yesterday
      },
    ],
  });

  // 8. Seed Daily Routines and Reminders for Anita Devi
  console.log('⏰ Seeding Reminders & Daily Routines...');
  await prisma.dailyRoutine.createMany({
    data: [
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        timeOfDay: '08:00 AM',
        activity: 'Morning Tea & Blood Pressure Medicine',
        isCompleted: true,
        category: 'Health',
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        timeOfDay: '01:30 PM',
        activity: 'Afternoon Lunch & Gentle Rest',
        isCompleted: false,
        category: 'Health',
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        timeOfDay: '05:30 PM',
        activity: 'Evening Walk in Nehru Park',
        isCompleted: false,
        category: 'Exercise',
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        timeOfDay: '08:30 PM',
        activity: 'Night Medicine with Warm Milk',
        isCompleted: false,
        category: 'Health',
      },
    ],
  });

  await prisma.reminder.createMany({
    data: [
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        time: '8:00 AM',
        label: 'Morning Medicine & Chai',
        iconType: 'breakfast',
        completed: true,
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        time: '11:00 AM',
        label: 'Drink Water & Hydrate',
        iconType: 'sun',
        completed: true,
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        time: '1:30 PM',
        label: 'Afternoon Lunch & Rest',
        iconType: 'lunch',
        completed: false,
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        time: '5:00 PM',
        label: 'Evening Walk in Garden',
        iconType: 'walk',
        completed: false,
      },
      {
        patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
        time: '8:30 PM',
        label: 'Night Medicine with Warm Milk',
        iconType: 'medicine',
        completed: false,
      },
    ],
  });

  await prisma.caregiver.create({
    data: {
      patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
      name: 'Priya Devi',
      relation: 'Daughter',
      phoneNumber: '+91 98765 43210',
      email: 'priya.devi@example.com',
    },
  });

  console.log('\n======================================================');
  console.log('✅ SmritiSetu 4-Patient Database Seeding Completed!');
  console.log('DEMO_PATIENT_ID = "23f55848-e317-4a06-ae05-3aa42d94cd10" (Anita Devi)');
  console.log('1. Anita Devi   - 72y, Assamese, Declining [Active Attention Alert]');
  console.log('2. Ramesh Das   - 68y, Assamese, Stable    [No Active Alert]');
  console.log('3. Maya Devi    - 75y, Nepali,   Declining [Active Monitor Alert - Hesitation]');
  console.log('4. Bikash Saikia - 70y, Bodo,    Stable    [No Active Alert]');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
