import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!sectionId) {
    return NextResponse.json(
      { message: "Missing section ID" },
      { status: 400 }
    );
  }

  try {
    const section = await db.section.findFirst({
      where: { 
        id: parseInt(sectionId),
        OR: [
          { createdByUserId: parseInt(session.user.id) },
          { isDefault: true }
        ]
      },
      include: {
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
      }
    });

    if (!section) {
      return NextResponse.json({ message: "Section not found" }, { status: 404 });
    }

    // Calculate progress
    const totalWords = section.words.length;
    const learnedWords = section.words.filter(word => 
      word.progress.some(p => p.isManuallyLearned)
    ).length;

    const sectionWithProgress = {
      id: section.id,
      name: section.name,
      description: section.description,
      isDefault: section.isDefault,
      createdByUserId: section.createdByUserId,
      createdAt: section.createdAt,
      words: section.words,
      totalWords,
      learnedWords,
    };

    return NextResponse.json(sectionWithProgress);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}