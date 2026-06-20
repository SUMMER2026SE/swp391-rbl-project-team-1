import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Cleaner] Scanning for empty exams...');
  const exams = await prisma.exam.findMany({
    include: {
      _count: {
        select: { examQuestions: true }
      }
    },
    orderBy: { id: 'asc' }
  });

  const emptyExams = exams.filter(e => e._count.examQuestions === 0);
  console.log(`[Cleaner] Found ${emptyExams.length} empty exams out of ${exams.length} total.`);

  for (const e of emptyExams) {
    console.log(`[Cleaner] Deleting empty exam: ID ${e.id} - "${e.title}"`);
    await prisma.exam.delete({
      where: { id: e.id }
    });
  }

  console.log('[Cleaner] Cleaned all empty exams successfully!');
}

main()
  .catch(e => console.error('[Cleaner Error]:', e))
  .finally(() => prisma.$disconnect());
