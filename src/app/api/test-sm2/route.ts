import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { calculateSM2, mapPerformanceToQuality } from '@/lib/sm2-algorithm';

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
    // Get current progress for the word
    let userProgress = await prisma.userProgress.findFirst({
      where: {
        userId: parseInt(session.user.id),
        wordId: parseInt(wordId),
      },
    });

    if (!userProgress) {
      // Create new progress entry
      userProgress = await prisma.userProgress.create({
        data: {
          userId: parseInt(session.user.id),
          wordId: parseInt(wordId),
          correctCount: 0,
          incorrectCount: 0,
          consecutiveCorrect: 0,
          timesSeen: 0,
          isManuallyLearned: false,
          easinessFactor: 2.5,
          interval: 1,
          repetition: 0,
          nextReviewDate: new Date(),
          quality: null,
        },
      });
    }

    // Test different scenarios
    const testScenarios = [
      { isCorrect: true, responseTime: 2000, sessionWordAttempts: 1 },
      { isCorrect: true, responseTime: 1500, sessionWordAttempts: 1 },
      { isCorrect: true, responseTime: 1000, sessionWordAttempts: 1 },
    ];

    const results = [];

    for (const scenario of testScenarios) {
      const quality = mapPerformanceToQuality(
        scenario.isCorrect,
        scenario.responseTime,
        scenario.sessionWordAttempts
      );

      const sm2Result = calculateSM2({
        quality,
        easinessFactor: userProgress.easinessFactor,
        interval: userProgress.interval,
        repetition: userProgress.repetition,
      });

      results.push({
        scenario,
        quality,
        sm2Result,
        wasLearned: sm2Result.isLearned && !userProgress.isManuallyLearned
      });

      // Update progress for next iteration
      userProgress = {
        ...userProgress,
        easinessFactor: sm2Result.easinessFactor,
        interval: sm2Result.interval,
        repetition: sm2Result.repetition,
        isManuallyLearned: sm2Result.isLearned,
      };
    }

    return NextResponse.json({
      initialProgress: {
        repetition: userProgress.repetition,
        isManuallyLearned: userProgress.isManuallyLearned,
        easinessFactor: userProgress.easinessFactor,
        interval: userProgress.interval,
      },
      testResults: results,
    });
  } catch (error) {
    console.error('Error testing SM2:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
