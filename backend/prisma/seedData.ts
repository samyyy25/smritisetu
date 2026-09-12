import { PrismaClient } from '@prisma/client';
import { DEMO_PATIENT_ID } from '../src/config';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding SmritiSetu database with real Reminders and Memories...');

  // 1. Ensure Demo Patient exists and has emergency contact & age
  let patient = await prisma.patient.findUnique({
    where: { id: DEMO_PATIENT_ID },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        id: DEMO_PATIENT_ID,
        name: 'Ramesh Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        age: 72,
        emergencyContactName: 'Priya Sharma (Daughter)',
        emergencyContactPhone: '+91 98765 43210',
        preferredLanguage: 'English',
        syntheticProfile: 'stable',
      },
    });
    console.log(`Created demo patient: ${patient.name} (${patient.id})`);
  } else {
    patient = await prisma.patient.update({
      where: { id: DEMO_PATIENT_ID },
      data: {
        age: 72,
        emergencyContactName: 'Priya Sharma (Daughter)',
        emergencyContactPhone: '+91 98765 43210',
      },
    });
    console.log(`Updated demo patient: ${patient.name}`);
  }

  // 2. Seed Real Daily Reminders matching Image 5
  await (prisma as any).reminder.deleteMany({
    where: { patientId: DEMO_PATIENT_ID },
  });

  const remindersData = [
    {
      patientId: DEMO_PATIENT_ID,
      time: '8:00 AM',
      label: 'Breakfast',
      iconType: 'breakfast',
      completed: true,
    },
    {
      patientId: DEMO_PATIENT_ID,
      time: '10:00 AM',
      label: 'Medicine',
      iconType: 'medicine',
      completed: true,
    },
    {
      patientId: DEMO_PATIENT_ID,
      time: '1:00 PM',
      label: 'Lunch',
      iconType: 'lunch',
      completed: false,
    },
    {
      patientId: DEMO_PATIENT_ID,
      time: '6:00 PM',
      label: 'Evening Walk',
      iconType: 'walk',
      completed: false,
    },
  ];

  for (const r of remindersData) {
    await (prisma as any).reminder.create({ data: r });
  }
  console.log(`✅ Seeded ${remindersData.length} daily reminders`);

  // 3. Seed Real Memories matching Image 5 Timeline
  const existingMemoriesCount = await prisma.memory.count({
    where: { patientId: DEMO_PATIENT_ID },
  });

  if (existingMemoriesCount < 3) {
    const memoriesData = [
      {
        patientId: DEMO_PATIENT_ID,
        year: '1978',
        personName: 'My childhood',
        relationship: 'Grandparents',
        place: 'Assam Tea Garden Village',
        description: 'Happy early mornings running between tea bushes and playing with grandfather.',
        photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop',
      },
      {
        patientId: DEMO_PATIENT_ID,
        year: '1989',
        personName: 'My family',
        relationship: 'Parents & Siblings',
        place: 'Jorhat, Assam',
        description: 'Family gathering during Bihu festival celebrations with music and feast.',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
      },
      {
        patientId: DEMO_PATIENT_ID,
        year: '1998',
        personName: 'My wedding',
        relationship: 'Sunita & Ramesh',
        place: 'Guwahati, Assam',
        description: 'Our traditional wedding day surrounded by elders, friends, and joyful blessings.',
        photoUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop',
      },
      {
        patientId: DEMO_PATIENT_ID,
        year: '2005',
        personName: 'My children',
        relationship: 'Priya & Arun',
        place: 'Family Home',
        description: 'Watching Priya and Arun learn to ride bicycles in the courtyard.',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      },
      {
        patientId: DEMO_PATIENT_ID,
        year: '2024',
        personName: 'Sunrise boat ride',
        relationship: 'Priya (Daughter)',
        place: 'Ghats of Varanasi',
        description: 'Peaceful dawn boat ride along the Ganga river with temple bells ringing softly.',
        photoUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop',
      },
    ];

    for (const m of memoriesData) {
      await prisma.memory.create({ data: m });
    }
    console.log(`✅ Seeded ${memoriesData.length} photo memories matching timeline`);
  }

  console.log('🎉 Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
