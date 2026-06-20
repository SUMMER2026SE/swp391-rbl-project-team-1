import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seeder] Reading documents.json...');
  let filePath = path.resolve('documents.json');
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve('../../documents.json');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve('../documents.json');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`File documents.json not found`);
  }
  const rawData = fs.readFileSync(filePath, 'utf8');
  const docs = JSON.parse(rawData);

  // Find a valid user to assign as uploader
  const user = await prisma.user.findFirst();
  const uploaderId = user ? user.id : 1;

  // Find all lessons
  const lessons = await prisma.lesson.findMany({ select: { id: true } });
  const lessonIds = lessons.map(l => l.id);

  if (lessonIds.length === 0) {
    throw new Error('No lessons found in database to link documents to!');
  }

  console.log(`[Seeder] Found ${lessonIds.length} lessons. Uploader user ID: ${uploaderId}`);
  console.log('[Seeder] Mapping to Document model...');

  const mappedDocs = docs.map((d: any, index: number) => {
    // Cycle through lesson IDs
    const lessonId = lessonIds[index % lessonIds.length];
    
    // Extract file type from drive_url or default to 'pdf'
    let fileType = 'pdf';
    const driveUrl = d.drive_url || '';
    if (driveUrl.includes('.docx')) fileType = 'docx';
    else if (driveUrl.includes('.xlsx')) fileType = 'xlsx';
    else if (driveUrl.includes('.zip')) fileType = 'zip';

    return {
      id: Number(d.id),
      title: String(d.title || ''),
      fileUrl: driveUrl || 'https://drive.google.com',
      fileType: fileType,
      lessonId: lessonId,
      uploadedBy: uploaderId,
      createdAt: d.created_at ? new Date(d.created_at) : new Date(),
    };
  });

  console.log('[Seeder] Inserting into Document table...');
  const chunkSize = 200;
  for (let i = 0; i < mappedDocs.length; i += chunkSize) {
    const chunk = mappedDocs.slice(i, i + chunkSize);
    await prisma.document.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`[Seeder] Inserted chunk ${i / chunkSize + 1} (${i + chunk.length}/${mappedDocs.length})`);
  }

  console.log('[Seeder] Document table seeding finished successfully!');
}

main()
  .catch(e => {
    console.error('[Seeder Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
