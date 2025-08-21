import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { getWordsForReview, shouldReviewWord } from '@/lib/sm2-algorithm';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const length = searchParams.get('length');
  const mode = searchParams.get('mode') || searchParams.get('focus'); // 'all' or 'difficult'

  if (!sectionId) {
    return NextResponse.json({ message: 'Section ID is required' }, { status: 400 });
  }

  try {
    const sectionWordsWithProgress = await prisma.word.findMany({
      where: {
        sectionId: parseInt(sectionId),
      },
      include: {
        progress: {
          where: {
            userId: parseInt(session.user.id),
          },
          take: 1, // We only need one progress entry per word for the current user
        },
      },
    });

    if (sectionWordsWithProgress.length === 0) {
      return NextResponse.json({ message: 'No words found in this section' }, { status: 404 });
    }

    const wordsWithLearningData = sectionWordsWithProgress.map(word => {
      const progress = word.progress[0] || {
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
      };
      return { ...word, progress };
    });

    let wordsToStudy = [];

    if (mode === 'difficult') {
      // Focus on words that are overdue or have low performance
      wordsToStudy = wordsWithLearningData
        .filter(word => {
          const progress = word.progress;
          const isOverdue = shouldReviewWord(progress.nextReviewDate);
          const hasLowPerformance = progress.easinessFactor < 2.0 || progress.incorrectCount > progress.correctCount;
          const isNotMastered = progress.repetition < 3;
          
          return isOverdue || hasLowPerformance || isNotMastered;
        })
        .sort((a, b) => {
          // Sort by urgency: overdue first, then by difficulty (low easiness factor)
          const aOverdue = shouldReviewWord(a.progress.nextReviewDate);
          const bOverdue = shouldReviewWord(b.progress.nextReviewDate);
          
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          
          // Both overdue or both not overdue, sort by easiness factor (harder words first)
          return a.progress.easinessFactor - b.progress.easinessFactor;
        });
    } else { // 'all' mode or default - use SM-2 intelligent scheduling
      // Get words for review using SM-2 algorithm
      const wordsForSM2 = wordsWithLearningData.map(word => ({
        id: word.id,
        nextReviewDate: word.progress.nextReviewDate,
        repetition: word.progress.repetition,
        easinessFactor: word.progress.easinessFactor,
        interval: word.progress.interval,
        word: word
      }));
      
      const prioritizedWords = getWordsForReview(wordsForSM2, parseInt(length || '20'));
      
      // Convert back to word format and add some new words if needed
      const reviewWords = prioritizedWords.map(item => 
        wordsForSM2.find(w => w.id === item.id)?.word
      ).filter(Boolean);
      
      // Add new words (never studied) if we have room
      const newWords = wordsWithLearningData
        .filter(word => word.progress.timesSeen === 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.max(0, parseInt(length || '10') - reviewWords.length));
      
      wordsToStudy = [...reviewWords, ...newWords];
    }

    // Apply session length limit
    if (length && length !== 'all') {
      const numWords = parseInt(length);
      if (!isNaN(numWords) && numWords > 0) {
        wordsToStudy = wordsToStudy.slice(0, numWords);
      }
    }

    // Ensure we have words to study after filtering/slicing
    if (wordsToStudy.length === 0 && sectionWordsWithProgress.length > 0) {
      // Fallback: if no "difficult" words or selected length is too small, just pick random words
      wordsToStudy = sectionWordsWithProgress.sort(() => 0.5 - Math.random()).slice(0, parseInt(length || '10'));
    } else if (wordsToStudy.length === 0) {
      return NextResponse.json({ message: 'No words to study based on criteria' }, { status: 404 });
    }

    const allEnglishTranslations = await prisma.word.findMany({
      select: {
        englishTranslation: true,
      },
    });
    const uniqueEnglishTranslations = Array.from(new Set(allEnglishTranslations.map(w => w.englishTranslation)));

    const flashcards = wordsToStudy.map(word => {
      const correctTranslation = word.englishTranslation;
      const incorrectOptions = uniqueEnglishTranslations
        .filter(t => t !== correctTranslation)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3); // Get 3 random incorrect options for better UX

      const options = [...incorrectOptions, correctTranslation].sort(() => 0.5 - Math.random());

      // Determine word level based on SM-2 data
      let level: 'new' | 'learning' | 'review' | 'mastered' = 'new';
      const progress = word.progress;
      
      if (progress.timesSeen === 0) {
        level = 'new';
      } else if (progress.repetition < 3) {
        level = 'learning';
      } else if (shouldReviewWord(progress.nextReviewDate)) {
        level = 'review';
      } else {
        level = 'mastered';
      }

      return {
        wordId: word.id,
        hebrewText: word.hebrewText,
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
      return NextResponse.json(
        { message: 'Section ID and words array are required' },
        { status: 400 }
      );
    }

    // Validate that the section exists and user has access to it
    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(sectionId),
        OR: [
          { createdByUserId: parseInt(session.user.id) },
          { isDefault: true }
        ]
      }
    });

    if (!section) {
      return NextResponse.json(
        { message: 'Section not found or access denied' },
        { status: 404 }
      );
    }

    // Validate and filter words
    const validWords = words.filter(word => 
      word.hebrewText && 
      word.englishTranslation && 
      word.hebrewText.trim() !== '' && 
      word.englishTranslation.trim() !== ''
    ).map(word => ({
      sectionId: parseInt(sectionId),
      hebrewText: word.hebrewText.trim(),
      englishTranslation: word.englishTranslation.trim()
    }));

    if (validWords.length === 0) {
      return NextResponse.json(
        { message: 'No valid words provided' },
        { status: 400 }
      );
    }

    // Check for duplicates within the section
    const existingWords = await prisma.word.findMany({
      where: {
        sectionId: parseInt(sectionId),
        OR: validWords.map(word => ({
          AND: [
            { hebrewText: word.hebrewText },
            { englishTranslation: word.englishTranslation }
          ]
        }))
      }
    });

    const existingWordKeys = new Set(
      existingWords.map(w => `${w.hebrewText}|${w.englishTranslation}`)
    );

    const newWords = validWords.filter(word => 
      !existingWordKeys.has(`${word.hebrewText}|${word.englishTranslation}`)
    );

    if (newWords.length === 0) {
      return NextResponse.json(
        { message: 'All words already exist in this section' },
        { status: 400 }
      );
    }

    // Create the new words
    const createdWords = await prisma.word.createMany({
      data: newWords,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: `Successfully added ${createdWords.count} words to the section`,
      addedCount: createdWords.count,
      duplicatesSkipped: validWords.length - newWords.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding words:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}