import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSeed() {
  const patientId = '23f55848-e317-4a06-ae05-3aa42d94cd10';
  
  let patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { memories: true }
  });

  if (!patient) {
    console.log('Creating demo patient...');
    patient = await prisma.patient.create({
      data: {
        id: patientId,
        name: 'Ramesh Sharma',
        age: 72,
        preferredLanguage: 'English',
        emergencyContactName: 'Priya Sharma (Daughter)',
        emergencyContactPhone: '+91 98765 43210'
      },
      include: { memories: true }
    });
  }

  console.log('Current patient:', patient.name);
  console.log('Current memories count:', patient.memories.length);

  if (patient.memories.length < 5) {
    console.log('Seeding real memories for DEMO_PATIENT_ID...');
    const seedMemories = [
      {
        patientId,
        personName: 'Priya Sharma',
        relationship: 'Daughter',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        year: '2018',
        place: 'Delhi',
        description: 'Our daughter Priya on her university graduation day in Delhi.'
      },
      {
        patientId,
        personName: 'Arun Sharma',
        relationship: 'Son',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        year: '2020',
        place: 'Jaipur',
        description: 'Arun lighting diyas with family at our home in Jaipur.'
      },
      {
        patientId,
        personName: 'Meenakshi Sharma',
        relationship: 'Wife',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        year: '1995',
        place: 'Kashmir',
        description: 'Meenakshi on our 25th anniversary trip to Dal Lake.'
      },
      {
        patientId,
        personName: 'Ananya',
        relationship: 'Granddaughter',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
        year: '2022',
        place: 'Bengaluru',
        description: 'Ananya cutting her 5th birthday cake with grandpa.'
      },
      {
        patientId,
        personName: 'Dr. Rajesh Sharma',
        relationship: 'Brother',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        year: '2019',
        place: 'Mumbai',
        description: 'My younger brother Rajesh who works as a physician.'
      }
    ];

    for (const mem of seedMemories) {
      await prisma.memory.create({
        data: mem
      });
    }
    console.log('Seeded 5 real memories successfully!');
  }

  const updatedPatient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { memories: true }
  });
  console.log('Updated memories count:', updatedPatient?.memories.length);
  console.log('Memories:', updatedPatient?.memories.map(m => ({ id: m.id, personName: m.personName, relationship: m.relationship, photoUrl: m.photoUrl })));
}

checkAndSeed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
