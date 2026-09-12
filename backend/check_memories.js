const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patientId = '23f55848-e317-4a06-ae05-3aa42d94cd10';
  const memories = await prisma.memory.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Found ${memories.length} memories for patient ${patientId}:`);
  console.log(JSON.stringify(memories, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
