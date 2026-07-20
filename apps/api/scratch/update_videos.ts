import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YOUTUBE_IDS = [
  'Mr3ywRC7oF8',
  '_9BxEU6sd8g',
  '1ONec36-_T4',
  'oe6dDM-EH98',
  'prlysAfn4EI',
  'vIIQ_EHV5iQ',
  'Xw4HfsclylM',
  'h9quwIKme0w',
  'HkSb88-_R80',
  'jbbfnOnDvKs',
  'ezMlkkOr784'
];

async function updateVideos() {
  console.log('Connecting to database...');
  const allLessons = await prisma.lesson.findMany();
  console.log(`Found ${allLessons.length} lessons in database. Updating video URLs...`);

  for (let i = 0; i < allLessons.length; i++) {
    const lesson = allLessons[i];
    const id = YOUTUBE_IDS[i % YOUTUBE_IDS.length];
    const newUrl = `https://www.youtube.com/embed/${id}`;
    
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoUrl: newUrl }
    });
    console.log(`Updated lesson #${lesson.id} ("${lesson.title}") -> ${newUrl}`);
  }

  console.log('Successfully updated all lesson video URLs in database!');
}

updateVideos()
  .catch(err => {
    console.error('Error updating videos:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
