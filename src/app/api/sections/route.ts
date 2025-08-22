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