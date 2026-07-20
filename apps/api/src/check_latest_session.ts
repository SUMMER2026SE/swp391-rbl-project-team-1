import './env.js';
import { ImportV2Service } from './modules/importV2/importV2.service.js';
import { prisma } from './lib/prisma.js';

async function main() {
  const s = await prisma.importSession.findUnique({ where: { id: 62 } });
  if (!s || !s.filePath) return;

  console.log(`Testing Session #62 on file: ${s.filePath}`);
  try {
    await ImportV2Service.runBackgroundParser(s.id, s.filePath, s.fileName, s.userId);
    console.log('SUCCESS!');
  } catch (err: any) {
    console.error('EXPLICIT ERROR TRACE:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
