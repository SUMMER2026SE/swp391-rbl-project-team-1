import { seedRealExamData } from '../src/utils/examImporter.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Runner] Starting seedRealExamData...');
  await seedRealExamData();
  console.log('[Runner] Finished seedRealExamData!');
}

main()
  .catch(e => {
    console.error('[Runner Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
