import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      const dbError = error as { code?: string; message?: string };
      console.log(`Database operation attempt ${attempt} failed:`, dbError.message);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * attempt, 2000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const language = searchParams.get('language');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const userId = parseInt(session.user.id);
    console.log(`Fetching words for user ${userId}, type: ${type}, language: ${language}`);

    // Step 1: Get user progress with minimal includes
    const progressQuery: Record<string, unknown> = {
      userId: userId,
      timesSeen: { gt: 0 }
    };

    // Add a timeout for the entire operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // First, just get the progress data
      const userProgressData = await retryOperation(async () => {
        return await prisma.userProgress.findMany({
          where: progressQuery,
          select: {
            id: true,
            wordId: true,
            correctCount: true,
            incorrectCount: true,
            consecutiveCorrect: true,
            timesSeen: true,
            isManuallyLearned: true,
            lastSeen: true,
            nextReviewDate: true,
            easinessFactor: true,
            interval: true,
            repetition: true,
            updatedAt: true
          },
          orderBy: [
            { updatedAt: 'desc' },
            { timesSeen: 'desc' }
          ]
        });
      });

      console.log(`Found ${userProgressData.length} progress records`);

      // Step 2: Filter by type in JavaScript
      let filteredProgress = userProgressData;
      if (type === 'learned') {
        filteredProgress = userProgressData.filter(p => 
          p.isManuallyLearned || p.consecutiveCorrect >= 3
        );
      } else if (type === 'difficult') {
        filteredProgress = userProgressData.filter(p => {
          const hasErrors = p.incorrectCount > 0;
          const moreWrongThanRight = p.incorrectCount > p.correctCount;
          const strugglingButSeen = p.consecutiveCorrect < 2 && p.timesSeen >= 3;
          return hasErrors && (moreWrongThanRight || strugglingButSeen);
        });
      }

      console.log(`After type filtering: ${filteredProgress.length} records`);

      // Step 3: Get the word IDs we need for this page
      const paginatedProgress = filteredProgress.slice(offset, offset + limit);
      const wordIds = paginatedProgress.map(p => p.wordId);

      if (wordIds.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({
          words: [],
          pagination: {
            total: filteredProgress.length,
            limit,
            offset,
            hasMore: false
          },
          summary: {
            totalWords: userProgressData.length,
            learnedWords: userProgressData.filter(p => p.isManuallyLearned || p.consecutiveCorrect >= 3).length,
            difficultWords: userProgressData.filter(p => {
              const hasErrors = p.incorrectCount > 0;
              const moreWrongThanRight = p.incorrectCount > p.correctCount;
              const strugglingButSeen = p.consecutiveCorrect < 2 && p.timesSeen >= 3;
              return hasErrors && (moreWrongThanRight || strugglingButSeen);
            }).length,
            averageAccuracy: 0
          }
        });
      }

      // Step 4: Get word details for just the words we need
      const wordQuery: Record<string, unknown> = {
        id: { in: wordIds }
      };

      // Apply language filter
      if (language) {
        wordQuery.language = { code: language };
      }

      // Apply search filter
      if (search && search.trim()) {
        const searchTerm = search.trim();
        wordQuery.OR = [
          { originalText: { contains: searchTerm, mode: 'insensitive' } },
          { translationText: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      const wordsData = await retryOperation(async () => {
        return await prisma.word.findMany({
          where: wordQuery,
          include: {
            language: {
              select: {
                code: true,
                name: true,
                nativeName: true,
                isRTL: true,
                fontFamily: true
              }
            },
            section: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
      });

      console.log(`Found ${wordsData.length} word records`);

      // Step 5: Combine progress and word data
      const combinedData = paginatedProgress
        .map(progress => {
          const word = wordsData.find(w => w.id === progress.wordId);
          if (!word) return null;
          
          const accuracy = progress.timesSeen > 0 
            ? Math.round((progress.correctCount / (progress.correctCount + progress.incorrectCount)) * 100) || 0
            : 0;
          
          const isLearned = progress.isManuallyLearned || progress.consecutiveCorrect >= 3;
          const isDifficult = progress.incorrectCount > progress.correctCount || 
                              (progress.consecutiveCorrect < 2 && progress.timesSeen >= 3);

          return {
            id: progress.id,
            wordId: progress.wordId,
            originalText: word.originalText,
            translationText: word.translationText,
            pronunciation: word.pronunciation,
            language: word.language,
            section: word.section,
            stats: {
              correctCount: progress.correctCount,
              incorrectCount: progress.incorrectCount,
              consecutiveCorrect: progress.consecutiveCorrect,
              timesSeen: progress.timesSeen,
              accuracy: accuracy,
              isLearned: isLearned,
              isDifficult: isDifficult,
              isManuallyLearned: progress.isManuallyLearned,
              lastSeen: progress.lastSeen,
              nextReviewDate: progress.nextReviewDate,
              easinessFactor: progress.easinessFactor,
              interval: progress.interval,
              repetition: progress.repetition
            }
          };
        })
        .filter(Boolean);

      // Calculate summary stats
      const summaryStats = {
        totalWords: userProgressData.length,
        learnedWords: userProgressData.filter(p => p.isManuallyLearned || p.consecutiveCorrect >= 3).length,
        difficultWords: userProgressData.filter(p => {
          const hasErrors = p.incorrectCount > 0;
          const moreWrongThanRight = p.incorrectCount > p.correctCount;
          const strugglingButSeen = p.consecutiveCorrect < 2 && p.timesSeen >= 3;
          return hasErrors && (moreWrongThanRight || strugglingButSeen);
        }).length,
        averageAccuracy: combinedData.length > 0 
          ? Math.round(combinedData.reduce((sum, w) => sum + w.stats.accuracy, 0) / combinedData.length)
          : 0
      };

      clearTimeout(timeoutId);

      return NextResponse.json({
        words: combinedData,
        pagination: {
          total: filteredProgress.length,
          limit,
          offset,
          hasMore: offset + limit < filteredProgress.length
        },
        summary: summaryStats
      });

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

  } catch (error) {
    console.error('Error fetching user words:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({ 
        message: 'Request timed out. Try filtering by a specific language or using search to narrow results.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      message: 'Internal server error. Please try again with more specific filters.' 
    }, { status: 500 });
  }
}