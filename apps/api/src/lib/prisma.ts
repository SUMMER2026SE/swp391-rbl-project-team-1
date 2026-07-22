import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    transactionOptions: {
      maxWait: 15000,
      timeout: 30000
    }
  });


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
