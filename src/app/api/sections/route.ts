import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { Section, Word, UserProgress, Language } from '@prisma/client';
import { isValidLanguageCode } from '@/config/languages';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('language');

    // If language is specified, filter by language
    const whereClause: Prisma.SectionWhereInput = {
      OR: [
        { createdByUserId: parseInt(session.user.id) },
        { isDefault: true }
      ]
    };

    if (languageCode) {
      if (!isValidLanguageCode(languageCode)) {
        return NextResponse.json({ message: 'Invalid language code' }, { status: 400 });
      }

      // Get language ID
      const language = await prisma.language.findUnique({
        where: { code: languageCode }
      });

      if (!language) {
        return NextResponse.json({ message: 'Language not found' }, { status: 404 });
      }

      whereClause.languageId = language.id;
    }

    const sections = await prisma.section.findMany({
      where: whereClause,
      include: {
        language: true,
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
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const sectionsWithProgress = sections.map((section: Section & { 
      words: (Word & { progress: UserProgress[] })[];
      language: Language;
    }) => {
      const totalWords = section.words.length;
      const learnedWords = section.words.filter(word => 
        word.progress.some(p => p.isManuallyLearned)
      ).length;
      return {
        id: section.id,
        name: section.name,
        description: section.description,
        isDefault: section.isDefault,
        languageId: section.languageId,
        language: {
          code: section.language.code,
          name: section.language.name,
          nativeName: section.language.nativeName,
          isRTL: section.language.isRTL
        },
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

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, language: languageCode, words } = body;

    if (!name || !languageCode || !words || !Array.isArray(words)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidLanguageCode(languageCode)) {
      return NextResponse.json({ message: 'Invalid language code' }, { status: 400 });
    }

    // Get language ID
    const language = await prisma.language.findUnique({
      where: { code: languageCode }
    });

    if (!language) {
      return NextResponse.json({ message: 'Language not found' }, { status: 404 });
    }

    // Validate words format
    interface WordInput {
      originalText: string;
      translationText: string;
      pronunciation?: string;
    }
    
    const validWords = words.filter((word: WordInput) => 
      word.originalText && word.translationText && 
      typeof word.originalText === 'string' && 
      typeof word.translationText === 'string'
    );

    if (validWords.length === 0) {
      return NextResponse.json({ message: 'No valid words provided' }, { status: 400 });
    }

    // Create section with words in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the section
      const section = await tx.section.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          languageId: language.id,
          createdByUserId: parseInt(session.user!.id),
          isDefault: false
        }
      });

      // Create the words
      const wordsData = validWords.map((word: WordInput) => ({
        originalText: word.originalText.trim(),
        translationText: word.translationText.trim(),
        pronunciation: word.pronunciation?.trim() || null,
        sectionId: section.id,
        languageId: language.id
      }));

      await tx.word.createMany({
        data: wordsData,
        skipDuplicates: true
      });

      return section;
    });

    return NextResponse.json({
      message: 'Section created successfully',
      sectionId: result.id,
      wordsCount: validWords.length
    });

  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}