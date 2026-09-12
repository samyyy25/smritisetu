import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          gameSessions: true,
          memories: true,
          reminders: true,
        },
      },
    },
  });
  console.log('Patients in DB:');
  patients.forEach((p) => {
    console.log(`- ${p.name} | ID: ${p.id} | Sessions: ${p._count.gameSessions} | Memories: ${p._count.memories} | Reminders: ${p._count.reminders}`);
  });
}

main().finally(() => prisma.$disconnect());
