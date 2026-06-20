import { prisma } from './lib/prisma.js';

async function main() {
  try {
    console.log("Testing course query...");
    const course = await prisma.course.findFirst();
    console.log("Course queried successfully! Result:", course);
  } catch (error) {
    console.error("Course query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
