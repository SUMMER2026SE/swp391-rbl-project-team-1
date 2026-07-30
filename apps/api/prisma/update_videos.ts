import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const YOUTUBE_IDS = [
  'V1y3_Tz1Gf4',
  '3Q90uJdSpXo',
  '537bNfX-i64',
  'F91V6c_yO50',
  'bM7SZ5SZbyY',
  'HGeUpeCjSbg',
  '01GzX1S6_sM',
  '7X83wS0K_mU',
  'l592D_V6v6U',
  'z1ZqQ1J8W1M'
];

async function main() {
  console.log('[Script] Updating all lessons in database with embeddable YouTube videos...');
  const lessons = await prisma.lesson.findMany({ select: { id: true } });
  console.log(`[Script] Found ${lessons.length} lessons in database.`);

  for (let i = 0; i < lessons.length; i++) {
    const youtubeId = YOUTUBE_IDS[i % YOUTUBE_IDS.length];
    const videoUrl = `https://www.youtube.com/embed/${youtubeId}`;
    await prisma.lesson.update({
      where: { id: lessons[i].id },
      data: { videoUrl }
    });
  }

  console.log(`[Script] Successfully assigned YouTube video URLs to all ${lessons.length} lessons!`);
}

main()
  .catch(err => {
    console.error('[Script] Error updating videos:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
