import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { calculateSM2, mapPerformanceToQuality } from '@/lib/sm2-algorithm';
import { UserProgress } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const wordId = searchParams.get('wordId');

  if (!wordId) {
    return NextResponse.json({ message: 'Word ID is required' }, { status: 400 });
  }

  try {
    const userProgress = await prisma.userProgress.findFirst({
      where: {
        userId: parseInt(session.user.id),
        wordId: parseInt(wordId),
      },
    });

    if (!userProgress) {
      return NextResponse.json({ message: 'Progress not found' }, { status: 404 });
    }

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { wordId, isCorrect, responseTime, sessionWordAttempts } = await request.json();

  if (!wordId || typeof isCorrect === 'undefined') {
    return NextResponse.json({ message: 'Word ID and correctness are required' }, { status: 400 });
  }

  try {
    let userProgress: UserProgress | null = null;
    
    try {
      userProgress = await prisma.userProgress.findFirst({
        where: {
          userId: parseInt(session.user.id),
          wordId: wordId,
        },
      });
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError.code === 'P1017' || dbError.code === 'P1001' || dbError.code === 'P1008') {
        // Retry once for connection errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        userProgress = await prisma.userProgress.findFirst({
          where: {
            userId: parseInt(session.user.id),
            wordId: wordId,
          },
        });
      } else {
        throw error;
      }
    }

    if (!userProgress) {
      try {
        userProgress = await prisma.userProgress.create({
          data: {
            userId: parseInt(session.user.id),
            wordId: wordId,
            correctCount: 0,
            incorrectCount: 0,
            consecutiveCorrect: 0,
            timesSeen: 0,
            isManuallyLearned: false,
            // SM-2 defaults
            easinessFactor: 2.5,
            interval: 1,
            repetition: 0,
            nextReviewDate: new Date(),
            quality: null,
          },
        });
      } catch (error: unknown) {
        const dbError = error as { code?: string };
        if (dbError.code === 'P1017' || dbError.code === 'P1001' || dbError.code === 'P1008') {
          // Retry once for connection errors
          await new Promise(resolve => setTimeout(resolve, 1000));
          userProgress = await prisma.userProgress.create({
            data: {
              userId: parseInt(session.user.id),
              wordId: wordId,
              correctCount: 0,
              incorrectCount: 0,
              consecutiveCorrect: 0,
              timesSeen: 0,
              isManuallyLearned: false,
              // SM-2 defaults
              easinessFactor: 2.5,
              interval: 1,
              repetition: 0,
              nextReviewDate: new Date(),
              quality: null,
            },
          });
        } else {
          throw error;
        }
      }
    }

    // Calculate SM-2 quality rating based on performance
    const quality = mapPerformanceToQuality(isCorrect, responseTime, sessionWordAttempts);
    

    
    // Apply SM-2 algorithm
    const sm2Result = calculateSM2({
      quality,
      easinessFactor: userProgress.easinessFactor,
      interval: userProgress.interval,
      repetition: userProgress.repetition,
    });

    // Ensure the nextReviewDate is a valid Date object
    const nextReviewDate = new Date(sm2Result.nextReviewDate);
    

    
    const updatedData = {
      timesSeen: userProgress.timesSeen + 1,
      lastSeen: new Date(),
      correctCount: isCorrect ? userProgress.correctCount + 1 : userProgress.correctCount,
      incorrectCount: isCorrect ? userProgress.incorrectCount : userProgress.incorrectCount + 1,
      consecutiveCorrect: isCorrect ? userProgress.consecutiveCorrect + 1 : 0,
      
      // SM-2 fields
      easinessFactor: sm2Result.easinessFactor,
      interval: sm2Result.interval,
      repetition: sm2Result.repetition,
      nextReviewDate: nextReviewDate,
      quality: sm2Result.quality,
      isManuallyLearned: sm2Result.isLearned,
    };

    let updatedProgress: UserProgress;
    try {
      updatedProgress = await prisma.userProgress.update({
        where: {
          id: userProgress.id,
        },
        data: updatedData,
      });

    } catch (error: unknown) {
      const dbError = error as { code?: string };
      console.error('Database update error:', dbError);
      if (dbError.code === 'P1017' || dbError.code === 'P1001' || dbError.code === 'P1008') {
        // Retry once for connection errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        updatedProgress = await prisma.userProgress.update({
          where: {
            id: userProgress.id,
          },
          data: updatedData,
        });

      } else {
        throw error;
      }
    }



    const wasLearned = sm2Result.isLearned && !userProgress.isManuallyLearned;
    

    
    return NextResponse.json({
      ...updatedProgress,
      wasLearned: wasLearned, // New learning in this session
      sm2Info: {
        quality: sm2Result.quality,
        nextReview: sm2Result.nextReviewDate,
        interval: sm2Result.interval,
        repetition: sm2Result.repetition
      }
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}