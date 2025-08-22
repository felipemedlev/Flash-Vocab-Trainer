import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkSeed() {
  try {
    const sections = await db.section.findMany({
      include: {
        words: true,
      },
    });

    console.log('Sections:', sections);
  } catch (error) {
    console.error('Error checking seed data:', error);
  } finally {
    await db.$disconnect();
  }
}

checkSeed();