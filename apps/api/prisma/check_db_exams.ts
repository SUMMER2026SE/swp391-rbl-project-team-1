import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({
    include: {
      _count: {
        select: { examQuestions: true }
      }
    },
    orderBy: { id: 'asc' }
  });
  console.log('All exams in DB with question counts:');
  exams.forEach(e => {
    console.log(`- ID ${e.id}: "${e.title}" (${e.subject}) -> ${e._count.examQuestions} questions`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
