import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { Section, Word, UserProgress } from '@prisma/client';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sections = await prisma.section.findMany({
      where: {
        OR: [
          { createdByUserId: parseInt(session.user.id) },
          { isDefault: true }
        ]
      },
      include: {
        words: {
          include: {
            progress: {
              where: {
                userId: parseInt(session.user.id),
              },
              take: 1,
            },
          },
        }
      }
    });

    const sectionsWithProgress = sections.map((section: Section & { words: (Word & { progress: UserProgress[] })[] }) => {
      const totalWords = section.words.length;
      const learnedWords = section.words.filter(word => 
        word.progress.some(p => p.isManuallyLearned)
      ).length;
      return {
        id: section.id,
        name: section.name,
        description: section.description,
        isDefault: section.isDefault,
        totalWords,
        learnedWords,
      };
    });

    return NextResponse.json(sectionsWithProgress);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}