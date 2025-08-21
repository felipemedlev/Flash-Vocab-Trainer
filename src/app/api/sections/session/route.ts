import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';
import db from "@/lib/db";


export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const limitParam = searchParams.get('limit');

  if (!sectionId) {
    return NextResponse.json({ message: "Missing section ID" }, { status: 400 });
  }

  const numericSectionId = parseInt(sectionId, 10);
  if (isNaN(numericSectionId)) {
    return NextResponse.json({ message: 'Invalid section ID' }, { status: 400 });
  }

  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  if (isNaN(limit)) {
    return NextResponse.json({ message: 'Invalid limit' }, { status: 400 });
  }

  try {
    const userId = parseInt(session.user.id);

    // Fetch words that are due for review
    const dueWords = await db.word.findMany({
      where: {
        sectionId: numericSectionId,
        progress: {
          some: {
            userId: userId,
            nextReviewDate: {
              lte: new Date(),
            },
          },
        },
      },
      include: {
        progress: {
          where: { userId: userId },
        },
      },
      take: limit,
    });

    let words = dueWords;
    const remainingLimit = limit - dueWords.length;

    // If not enough due words, fetch new words
    if (remainingLimit > 0) {
      const newWords = await db.word.findMany({
        where: {
          sectionId: numericSectionId,
          progress: {
            none: {
              userId: userId,
            },
          },
        },
        include: {
          progress: true,
        },
        take: remainingLimit,
      });
      words = [...dueWords, ...newWords];
    }

    // If still not enough words, get some from the review pile, even if not due
    if (words.length < limit) {
      const moreWords = await db.word.findMany({
        where: {
          sectionId: numericSectionId,
          id: {
            notIn: words.map(w => w.id),
          },
          progress: {
            some: {
              userId: userId,
            },
          },
        },
        orderBy: {
          progress: {
            _count: 'asc', // Or some other logic to pick words
          },
        },
        take: limit - words.length,
        include: {
          progress: {
            where: { userId: userId },
          },
        },
      });
      words = [...words, ...moreWords];
    }

    // Apply SM-2 algorithm to each word for initial state
    const wordsForSession = words.map(word => {
      const progress = word.progress.find(p => p.userId === userId);
      if (progress) {
        return {
          ...word,
          interval: progress.interval,
          easinessFactor: progress.easinessFactor,
          repetition: progress.repetition,
          nextReviewDate: progress.nextReviewDate,
        };
      }
      return { ...word, interval: 1, easinessFactor: 2.5, repetition: 0, nextReviewDate: new Date() };
    });

    return NextResponse.json(wordsForSession);
  } catch (error) {
    console.error("Error fetching study session:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}