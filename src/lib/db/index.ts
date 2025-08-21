import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv';

config(); // Load environment variables from .env file

// Global variable to prevent multiple Prisma instances in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with proper connection configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Use global variable in development to prevent hot reload issues
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
