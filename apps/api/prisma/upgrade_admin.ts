import { prisma } from '../src/lib/prisma';

async function upgrade() {
  const email = 'tranvanthuan2005tt@gmail.com';
  console.log(`Searching for user with email: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found!`);
    process.exit(1);
  }
  
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'ADMIN',
      admin: {
        connectOrCreate: {
          where: { userId: user.id },
          create: {}
        }
      }
    }
  });

  console.log(`Success! Upgraded user ${updated.email} to role ${updated.role}`);
  process.exit(0);
}

upgrade().catch(err => {
  console.error(err);
  process.exit(1);
});
