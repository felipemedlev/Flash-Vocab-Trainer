import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { wordId, isCorrect } = await request.json();

  if (!wordId || typeof isCorrect === 'undefined') {
    return NextResponse.json({ message: 'Word ID and correctness are required' }, { status: 400 });
  }

  try {
    const userId = session.user.id;

    let userProgress = await prisma.userProgress.findFirst({
      where: {
        userId: parseInt(session.user.id),
        wordId: wordId,
      },
    });

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId: parseInt(session.user.id),
          wordId: wordId,
          correctCount: 0,
          incorrectCount: 0,
          consecutiveCorrect: 0,
          timesSeen: 0,
          isManuallyLearned: false,
        },
      });
    }

    const updatedData: {
      timesSeen: number;
      lastSeen: Date;
      correctCount?: number;
      incorrectCount?: number;
      consecutiveCorrect?: number;
      isManuallyLearned?: boolean;
    } = {
      timesSeen: userProgress.timesSeen + 1,
      lastSeen: new Date(),
    };

    if (isCorrect) {
      updatedData.correctCount = userProgress.correctCount + 1;
      updatedData.consecutiveCorrect = userProgress.consecutiveCorrect + 1;
      if (userProgress.incorrectCount > 0) {
        // If the user was wrong before, reset incorrect count after a correct answer
        updatedData.incorrectCount = 0;
      }

      // After 3 consecutive correct answers, mark as learned
      if (updatedData.consecutiveCorrect >= 3) {
        updatedData.isManuallyLearned = true;
      }
    } else {
      updatedData.incorrectCount = userProgress.incorrectCount + 1;
      updatedData.consecutiveCorrect = 0; // Reset consecutive correct on incorrect answer
      updatedData.isManuallyLearned = false; // If previously learned, mark as not learned if answered incorrectly
    }

    const updatedProgress = await prisma.userProgress.update({
      where: {
        id: userProgress.id,
      },
      data: updatedData,
    });

    // Streak logic
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastSession = user.updatedAt; // Using updatedAt for simplicity
      lastSession.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastSession.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = user.currentStreak;
      if (diffDays === 1) {
        newStreak++;
      } else if (diffDays > 1) {
        newStreak = 1;
      }

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}