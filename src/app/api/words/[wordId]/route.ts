import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ wordId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { hebrewText, englishTranslation } = await request.json();
    const { wordId: wordIdParam } = await params;
    const wordId = parseInt(wordIdParam);

    if (!hebrewText?.trim() || !englishTranslation?.trim()) {
      return NextResponse.json(
        { message: 'Hebrew text and English translation are required' },
        { status: 400 }
      );
    }

    // Check if word exists and user has access
    const existingWord = await prisma.word.findFirst({
      where: {
        id: wordId,
        section: {
          OR: [
            { createdByUserId: parseInt(session.user.id) },
            { isDefault: true }
          ]
        }
      },
      include: { section: true }
    });

    if (!existingWord) {
      return NextResponse.json(
        { message: 'Word not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow editing if user created the section (not default sections)
    if (existingWord.section.isDefault && existingWord.section.createdByUserId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Cannot edit words in default sections' },
        { status: 403 }
      );
    }

    // Check for duplicates within the same section (excluding current word)
    const duplicate = await prisma.word.findFirst({
      where: {
        sectionId: existingWord.sectionId,
        hebrewText: hebrewText.trim(),
        englishTranslation: englishTranslation.trim(),
        NOT: { id: wordId }
      }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: 'A word with this Hebrew text and English translation already exists in this section' },
        { status: 400 }
      );
    }

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: {
        hebrewText: hebrewText.trim(),
        englishTranslation: englishTranslation.trim()
      }
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ wordId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { wordId: wordIdParam } = await params;
    const wordId = parseInt(wordIdParam);

    // Check if word exists and user has access
    const existingWord = await prisma.word.findFirst({
      where: {
        id: wordId,
        section: {
          OR: [
            { createdByUserId: parseInt(session.user.id) },
            { isDefault: true }
          ]
        }
      },
      include: { section: true }
    });

    if (!existingWord) {
      return NextResponse.json(
        { message: 'Word not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow deleting if user created the section (not default sections)
    if (existingWord.section.isDefault && existingWord.section.createdByUserId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Cannot delete words from default sections' },
        { status: 403 }
      );
    }

    // Delete associated progress entries first
    await prisma.userProgress.deleteMany({
      where: { wordId: wordId }
    });

    // Delete the word
    await prisma.word.delete({
      where: { id: wordId }
    });

    return NextResponse.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
