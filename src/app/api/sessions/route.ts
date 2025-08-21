import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sectionId, wordsStudied, correctAnswers, sessionLength } = await request.json();

    if (!sectionId || typeof wordsStudied !== 'number' || typeof correctAnswers !== 'number' || typeof sessionLength !== 'number') {
      return NextResponse.json({ 
        message: 'Section ID, words studied, correct answers, and session length are required' 
      }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // Create session history record
    const sessionHistory = await prisma.sessionHistory.create({
      data: {
        userId,
        wordsStudied,
        correctAnswers,
        sessionLength,
        sessionDate: new Date(),
      },
    });

    // Update streak logic after creating session history
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user has already studied today by looking at session history (excluding current session)
      const todaySession = await prisma.sessionHistory.findFirst({
        where: {
          userId: userId,
          sessionDate: {
            gte: today
          },
          id: {
            not: sessionHistory.id // Exclude the session we just created
          }
        }
      });

      // Only update streak if this is the first session today
      if (!todaySession) {
        // Get the last study session date from session history (excluding today's session)
        const lastStudySession = await prisma.sessionHistory.findFirst({
          where: { 
            userId: userId,
            id: {
              not: sessionHistory.id // Exclude the session we just created
            }
          },
          orderBy: { sessionDate: 'desc' },
          take: 1,
        });

        let newStreak = user.currentStreak;
        
        if (!lastStudySession) {
          // This is the user's very first study session ever
          newStreak = 1;
        } else {
          // Calculate days since last study session
          const lastSessionDate = new Date(lastStudySession.sessionDate);
          lastSessionDate.setHours(0, 0, 0, 0);

          const diffTime = today.getTime() - lastSessionDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day - increment streak
            newStreak++;
          } else if (diffDays === 0) {
            // Same day - this shouldn't happen since we check for todaySession above
            // but keep current streak just in case
            newStreak = user.currentStreak;
          } else {
            // Missed days - reset streak to 1 (today becomes day 1 of new streak)
            newStreak = 1;
          }
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            updatedAt: new Date(),
          },
        });
      }
    }

    // Get updated user stats for response
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
      }
    });

    const wordsLearned = await prisma.userProgress.count({
      where: {
        userId: userId,
        isManuallyLearned: true,
      },
    });

    // Calculate accuracy
    const accuracy = wordsStudied > 0 ? Math.round((correctAnswers / wordsStudied) * 100) : 0;

    return NextResponse.json({
      sessionId: sessionHistory.id,
      wordsStudied,
      correctAnswers,
      accuracy,
      sessionLength,
      currentStreak: userStats?.currentStreak || 0,
      totalWordsLearned: wordsLearned,
      message: 'Session completed successfully!'
    });
  } catch (error) {
    console.error('Error creating session history:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    
    // Get recent sessions
    const recentSessions = await prisma.sessionHistory.findMany({
      where: { userId },
      orderBy: { sessionDate: 'desc' },
      take: 10,
    });

    // Get today's study progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysSessions = await prisma.sessionHistory.findMany({
      where: {
        userId,
        sessionDate: {
          gte: today
        }
      }
    });

    const todayWordsStudied = todaysSessions.reduce((total, session) => total + session.wordsStudied, 0);
    const dailyTarget = 10; // Default daily target
    const dailyProgress = Math.min((todayWordsStudied / dailyTarget) * 100, 100);

    return NextResponse.json({
      recentSessions,
      todayWordsStudied,
      dailyTarget,
      dailyProgress,
      hasStudiedToday: todaysSessions.length > 0
    });
  } catch (error) {
    console.error('Error fetching session data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
