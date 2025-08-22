import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ wordId: string }> }
) {
  const { wordId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const wordIdNum = parseInt(wordId, 10);
    if (isNaN(wordIdNum)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const { originalText, translationText, pronunciation } = await request.json();

    // Validate input
    if (!originalText?.trim() || !translationText?.trim()) {
      return NextResponse.json(
        { error: "Original text and translation are required" },
        { status: 400 }
      );
    }

    // Check if the word exists and if the user has permission to edit it
    const existingWord = await db.word.findUnique({
      where: { id: wordIdNum },
      include: {
        section: {
          select: {
            createdByUserId: true,
            isDefault: true,
          },
        },
      },
    });

    if (!existingWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Check if user owns the section (can only edit custom sections, not default ones)
    const userId = parseInt(session.user.id, 10);
    if (
      existingWord.section.isDefault ||
      existingWord.section.createdByUserId !== userId
    ) {
      return NextResponse.json(
        { error: "You can only edit words in your custom sections" },
        { status: 403 }
      );
    }

    // Check for duplicates in the same section
    const duplicateWord = await db.word.findFirst({
      where: {
        sectionId: existingWord.sectionId,
        originalText: originalText.trim(),
        translationText: translationText.trim(),
        id: { not: wordIdNum }, // Exclude the current word being updated
      },
    });

    if (duplicateWord) {
      return NextResponse.json(
        { error: "A word with this original text and translation already exists in this section" },
        { status: 409 }
      );
    }

    // Update the word
    const updatedWord = await db.word.update({
      where: { id: wordIdNum },
      data: {
        originalText: originalText.trim(),
        translationText: translationText.trim(),
        pronunciation: pronunciation?.trim() || undefined,
      },
    });

    return NextResponse.json({
      message: "Word updated successfully",
      word: updatedWord,
    });
  } catch (error) {
    console.error("Error updating word:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ wordId: string }> }
) {
  const { wordId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const wordIdNum = parseInt(wordId, 10);
    if (isNaN(wordIdNum)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }

    // Check if the word exists and if the user has permission to delete it
    const existingWord = await db.word.findUnique({
      where: { id: wordIdNum },
      include: {
        section: {
          select: {
            createdByUserId: true,
            isDefault: true,
          },
        },
      },
    });

    if (!existingWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Check if user owns the section (can only delete words from custom sections)
    const userId = parseInt(session.user.id, 10);
    if (
      existingWord.section.isDefault ||
      existingWord.section.createdByUserId !== userId
    ) {
      return NextResponse.json(
        { error: "You can only delete words from your custom sections" },
        { status: 403 }
      );
    }

    // Delete associated user progress first (due to foreign key constraints)
    await db.userProgress.deleteMany({
      where: { wordId: wordIdNum },
    });

    // Delete the word
    await db.word.delete({
      where: { id: wordIdNum },
    });

    return NextResponse.json({
      message: "Word deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting word:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}