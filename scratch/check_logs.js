import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.importSession.findMany({
    orderBy: { id: 'desc' },
    take: 5,
    include: { logs: true }
  });
  console.log('--- SESSIONS ---');
  sessions.forEach(s => {
    console.log(`Session #${s.id} | File: ${s.fileName} | Status: ${s.status}`);
    s.logs.forEach(l => {
      console.log(`   [${l.level}] ${l.message} | Details: ${l.details || ''}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
