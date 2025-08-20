import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const length = searchParams.get('length');
  const mode = searchParams.get('focus'); // 'all' or 'difficult'

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
      };
      return { ...word, progress };
    });

    let wordsToStudy = [];

    if (mode === 'difficult') {
      // Prioritize words with incorrect answers or low consecutive correct answers
      wordsToStudy = wordsWithLearningData
        .filter(word => word.progress.incorrectCount > 0 || word.progress.consecutiveCorrect < 3)
        .sort((a, b) => b.progress.incorrectCount - a.progress.incorrectCount); // Sort by most incorrect
    } else { // 'all' mode or default
      // Mix difficult words with new/learned words
      const difficultWords = wordsWithLearningData
        .filter(word => word.progress.incorrectCount > 0 || word.progress.consecutiveCorrect < 3)
        .sort((a, b) => b.progress.incorrectCount - a.progress.incorrectCount);

      const newAndLearnedWords = wordsWithLearningData
        .filter(word => word.progress.incorrectCount === 0 && word.progress.consecutiveCorrect >= 3)
        .sort(() => 0.5 - Math.random()); // Randomize learned words for occasional review

      const unseenWords = wordsWithLearningData
        .filter(word => word.progress.timesSeen === 0)
        .sort(() => 0.5 - Math.random());

      // Simple mixing strategy: prioritize difficult, then new, then learned
      wordsToStudy = [...difficultWords, ...unseenWords, ...newAndLearnedWords];
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
        .slice(0, 9); // Get 9 random incorrect options

      const options = [...incorrectOptions, correctTranslation].sort(() => 0.5 - Math.random());

      return {
        wordId: word.id,
        hebrewText: word.hebrewText,
        correctTranslation: correctTranslation,
        options: options,
      };
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching words for study session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}