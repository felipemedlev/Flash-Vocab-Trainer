import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { getWordsForReview, shouldReviewWord } from '@/lib/sm2-algorithm';

const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      const dbError = error as { code?: string; message?: string };
      console.log(`Database operation attempt ${attempt} failed:`, dbError.message);

      if (dbError.code === 'P1017' || dbError.code === 'P1001' || dbError.code === 'P1008') {
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

// Helper function to get manually learned word IDs for a user
const getManuallyLearnedWordIds = async (userId: number): Promise<number[]> => {
  const manuallyLearnedProgress = await retryOperation(() =>
    prisma.userProgress.findMany({
      where: {
        userId: userId,
        isManuallyLearned: true,
      },
      select: {
        wordId: true,
      },
    })
  );
  return manuallyLearnedProgress.map(p => p.wordId);
};

// Helper function to get words from section excluding manually learned words
const getSectionWords = async (sectionId: number, userId: number, manuallyLearnedWordIds: number[], limit: number) => {
  return retryOperation(() =>
    prisma.word.findMany({
      where: {
        sectionId: sectionId,
        id: {
          notIn: manuallyLearnedWordIds,
        },
      },
      take: limit,
      include: {
        progress: {
          where: {
            userId: userId,
          },
          take: 1,
        },
      },
      orderBy: {
        id: 'asc'
      }
    })
  );
};

// Helper function to get English translations excluding manually learned words
const getSectionEnglishTranslations = async (sectionId: number, manuallyLearnedWordIds: number[]) => {
  const translations = await retryOperation(() =>
    prisma.word.findMany({
      where: {
        sectionId: sectionId,
        id: {
          notIn: manuallyLearnedWordIds,
        },
      },
      select: {
        translationText: true,
      },
    })
  );
  return Array.from(new Set(translations.map(w => w.translationText)));
};

// Helper function to create default progress object
const createDefaultProgress = () => ({
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
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const length = searchParams.get('length');
  const offset = searchParams.get('offset');
  const simple = searchParams.get('simple') === 'true';

  let validatedLength = 20;
  if (length) {
    const parsedLength = parseInt(length);
    if (!isNaN(parsedLength) && parsedLength > 0) {
      validatedLength = Math.min(parsedLength, 100);
    }
  }

  let validatedOffset = 0;
  if (offset) {
    const parsedOffset = parseInt(offset);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      validatedOffset = parsedOffset;
    }
  }

  if (!sectionId) {
    return NextResponse.json({ message: 'Section ID is required' }, { status: 400 });
  }

  try {
    if (simple) {
      // Get total count for pagination info
      const totalWordsCount = await retryOperation(() =>
        prisma.word.count({
          where: {
            sectionId: parseInt(sectionId),
          }
        })
      );

      const words = await retryOperation(() =>
        prisma.word.findMany({
          where: {
            sectionId: parseInt(sectionId),
          },
          take: validatedLength,
          skip: validatedOffset,
          select: {
            id: true,
            originalText: true,
            translationText: true,
            pronunciation: true,
            createdAt: true,
          },
          orderBy: {
            id: 'asc'
          }
        })
      );

      return NextResponse.json({
        words: words.map(word => ({
          wordId: word.id,
          originalText: word.originalText,
          translationText: word.translationText,
          pronunciation: word.pronunciation,
          createdAt: word.createdAt
        })),
        totalWords: totalWordsCount,
        currentPage: Math.floor(validatedOffset / validatedLength) + 1,
        totalPages: Math.ceil(totalWordsCount / validatedLength)
      });
    }

    // Optimize: Limit the number of words fetched based on session length
    const maxWordsToFetch = validatedLength; // Use validated length

    // First, get a count of total words in the section for better decision making
    const totalWordsCount = await retryOperation(() =>
      prisma.word.count({
        where: {
          sectionId: parseInt(sectionId),
        }
      })
    );

    if (totalWordsCount === 0) {
      return NextResponse.json({ message: 'No words found in this section' }, { status: 404 });
    }

    // Get manually learned word IDs and section words using helper functions
    const userId = parseInt(session.user.id);
    const parsedSectionId = parseInt(sectionId);
    const manuallyLearnedWordIds = await getManuallyLearnedWordIds(userId);
    const sectionWordsWithProgress = await getSectionWords(parsedSectionId, userId, manuallyLearnedWordIds, maxWordsToFetch);

    if (sectionWordsWithProgress.length === 0) {
      return NextResponse.json({ message: 'No words found in this section' }, { status: 404 });
    }

    const wordsWithLearningData = sectionWordsWithProgress.map(word => {
      const progress = word.progress[0] || createDefaultProgress();
      return { ...word, progress };
    });

    // Simple word selection: mix of review words and new words
    const wordsForSM2 = wordsWithLearningData.map(word => ({
      id: word.id,
      nextReviewDate: word.progress.nextReviewDate,
      repetition: word.progress.repetition,
      easinessFactor: word.progress.easinessFactor,
      interval: word.progress.interval,
      word: word
    }));

    const prioritizedWords = getWordsForReview(wordsForSM2, validatedLength);

    // Convert back to word format and add some new words if needed
    const reviewWords = prioritizedWords.map(item =>
      wordsForSM2.find(w => w.id === item.id)?.word
    ).filter(Boolean);

    // Add new words (never studied) if we have room
    const newWords = wordsWithLearningData
      .filter(word => word.progress.timesSeen === 0 && !reviewWords.some(rw => rw?.id === word.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.max(0, validatedLength - reviewWords.length));

    let wordsToStudy = [...reviewWords, ...newWords];

    // If we still don't have enough words, add any remaining words from the section
    if (wordsToStudy.length < validatedLength) {
      const usedWordIds = new Set(wordsToStudy.map(w => w?.id).filter(Boolean));
      const remainingWords = wordsWithLearningData
        .filter(word => !usedWordIds.has(word.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, validatedLength - wordsToStudy.length);
      
      wordsToStudy = [...wordsToStudy, ...remainingWords];
    }

    // Apply session length limit and filter out any null/undefined entries
    const finalWordsToStudy = wordsToStudy.filter(Boolean).slice(0, validatedLength);

    // Ensure we have words to study after filtering/slicing
    if (finalWordsToStudy.length === 0 && sectionWordsWithProgress.length > 0) {
      // Fallback: if no words selected, just pick random words (ensuring uniqueness)
      const fallbackWords = [...sectionWordsWithProgress]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(validatedLength, sectionWordsWithProgress.length));

      // Get English translations for fallback using helper function
      const fallbackUniqueTranslations = await getSectionEnglishTranslations(parsedSectionId, manuallyLearnedWordIds);

      const fallbackFlashcards = fallbackWords.map(word => {
        const correctTranslation = word.translationText;
        const incorrectOptions = fallbackUniqueTranslations
          .filter(t => t !== correctTranslation)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const options = [...incorrectOptions, correctTranslation].sort(() => 0.5 - Math.random());

        let level: 'new' | 'learning' | 'review' | 'mastered' = 'new';
        const progress = word.progress[0] || createDefaultProgress();

        if (progress.timesSeen === 0) {
          level = 'new';
        } else if (progress.repetition < 3) {
          level = 'learning';
        } else if (progress.isManuallyLearned && !shouldReviewWord(progress.nextReviewDate)) {
          level = 'mastered';
        } else {
          level = 'review';
        }

        return {
          wordId: word.id,
          originalText: word.originalText,
          pronunciation: word.pronunciation,
          correctTranslation: correctTranslation,
          options: options,
          level: level,
          sm2Data: {
            easinessFactor: progress.easinessFactor,
            interval: progress.interval,
            repetition: progress.repetition,
            nextReviewDate: progress.nextReviewDate
          }
        };
      });

      return NextResponse.json(fallbackFlashcards);
    } else if (finalWordsToStudy.length === 0) {
      return NextResponse.json({ message: 'No words to study in this section' }, { status: 404 });
    }

    // Get English translations for options using helper function
    const uniqueEnglishTranslations = await getSectionEnglishTranslations(parsedSectionId, manuallyLearnedWordIds);

    const flashcards = finalWordsToStudy.map(word => {
      const correctTranslation = word.translationText;
      const incorrectOptions = uniqueEnglishTranslations
        .filter(t => t !== correctTranslation)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3); // Get 3 random incorrect options for better UX

      const options = [...incorrectOptions, correctTranslation].sort(() => 0.5 - Math.random());

      // Determine word level based on SM-2 data
      let level: 'new' | 'learning' | 'review' | 'mastered' = 'new';
      const progress = word.progress[0] || createDefaultProgress();

      if (progress.timesSeen === 0) {
        level = 'new';
      } else if (progress.repetition < 3) {
        level = 'learning';
      } else if (progress.isManuallyLearned && !shouldReviewWord(progress.nextReviewDate)) {
        level = 'mastered';
      } else {
        level = 'review';
      }

      return {
        wordId: word.id,
        originalText: word.originalText,
        pronunciation: word.pronunciation,
        correctTranslation: correctTranslation,
        options: options,
        level: level,
        sm2Data: {
          easinessFactor: progress.easinessFactor,
          interval: progress.interval,
          repetition: progress.repetition,
          nextReviewDate: progress.nextReviewDate
        }
      };
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching words for study session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sectionId, words } = await request.json();

    if (!sectionId || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ message: 'Section ID and words array are required' }, { status: 400 });
    }

    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(sectionId),
        OR: [{ createdByUserId: parseInt(session.user.id) }, { isDefault: true }],
      },
    });

    if (!section) {
      return NextResponse.json({ message: 'Section not found or access denied' }, { status: 404 });
    }

    const validWords = words
      .map(word => ({
        originalText: word.originalText?.trim(),
        translationText: word.translationText?.trim(),
        pronunciation: word.pronunciation?.trim() || undefined,
        sectionId: parseInt(sectionId),
        languageId: section.languageId,
      }))
      .filter(word => word.originalText && word.translationText);

    if (validWords.length === 0) {
      return NextResponse.json({ message: 'No valid words provided' }, { status: 400 });
    }

    const createdWords = await prisma.word.createMany({
      data: validWords,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `Successfully added ${createdWords.count} words to the section`,
        addedCount: createdWords.count,
        duplicatesSkipped: validWords.length - createdWords.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding words:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}