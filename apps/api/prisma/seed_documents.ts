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
    throw new Error(`File documents.json not found at ${filePath}`);
  }
  const rawData = fs.readFileSync(filePath, 'utf8');
  const docs = JSON.parse(rawData);
  console.log(`[Seeder] Loaded ${docs.length} documents.`);

  console.log('[Seeder] Mapping document data...');
  const mappedDocs = docs.map((d: any) => ({
    id: Number(d.id),
    title: String(d.title || ''),
    description: d.description ? String(d.description) : null,
    subject: String(d.subject || ''),
    level: String(d.level || ''),
    isFree: d.is_free === 1 || d.is_free === true,
    driveUrl: d.drive_url ? String(d.drive_url) : null,
    imageUrl: d.image_url ? String(d.image_url) : null,
    price: Number(d.price || 0),
    isActive: d.is_active === 1 || d.is_active === true,
    isDeleted: d.is_deleted === 1 || d.is_deleted === true,
    createdAt: d.created_at ? new Date(d.created_at) : new Date(),
    updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
    commissionPercent: d.commission_percent !== null ? Number(d.commission_percent) : null,
    markdownDescription: d.markdown_description ? String(d.markdown_description) : null,
  }));

  console.log('[Seeder] Inserting into database...');
  const chunkSize = 200;
  for (let i = 0; i < mappedDocs.length; i += chunkSize) {
    const chunk = mappedDocs.slice(i, i + chunkSize);
    await prisma.documentResource.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`[Seeder] Inserted chunk ${i / chunkSize + 1} (${i + chunk.length}/${mappedDocs.length})`);
  }

  console.log('[Seeder] Seeding finished successfully!');
}

main()
  .catch(e => {
    console.error('[Seeder Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
