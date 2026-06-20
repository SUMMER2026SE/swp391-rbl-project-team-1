import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('[SQL Importer] Starting import of 2026 Math mock exams from sql_exams.json...');
  
  const jsonPath = path.resolve(__dirname, 'sql_exams.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[SQL Importer] Error: ${jsonPath} does not exist.`);
    return;
  }
  
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const sqlExams = JSON.parse(rawData);
  
  // Find admin user or fallback
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  const creatorId = adminUser ? adminUser.id : 1;
  
  for (const item of sqlExams) {
    // Check if exam already exists by title
    const existing = await prisma.exam.findFirst({
      where: { title: item.title }
    });
    
    if (existing) {
      console.log(`[SQL Importer] Exam "${item.title}" already exists. Skipping.`);
      continue;
    }
    
    console.log(`[SQL Importer] Creating exam: "${item.title}"`);
    
    const exam = await prisma.exam.create({
      data: {
        title: item.title,
        subject: item.subject,
        subjectGroup: item.subjectGroup,
        duration: item.duration,
        isPublic: true,
        createdBy: creatorId,
        year: item.year,
        source: item.source,
        totalQuestions: item.totalQuestions,
        difficulty: 'MEDIUM',
        status: 'published'
      }
    });
    
    const createdQuestions = [];
    for (const q of item.questions) {
      const question = await prisma.question.create({
        data: {
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: item.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          createdBy: creatorId
        }
      });
      
      createdQuestions.push({ questionId: question.id, order: q.question_number });
    }
    
    // Link questions to exam
    for (const link of createdQuestions) {
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: link.questionId,
          order: link.order
        }
      });
    }
    
    console.log(`[SQL Importer] Completed importing "${item.title}" with ${item.totalQuestions} questions.`);
  }
  
  console.log('[SQL Importer] Done importing all SQL exams!');
}

main()
  .catch((e) => {
    console.error('[SQL Importer Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
