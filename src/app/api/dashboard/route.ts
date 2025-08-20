import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Section, Word } from '@prisma/client';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id, 10);

    const wordsLearned = await db.userProgress.count({
      where: {
        userId: userId,
        isManuallyLearned: true,
      },
    });

    const sections = await db.section.findMany({
      where: {
        createdByUserId: userId,
      },
      include: {
        words: true,
      },
    });

    const sectionsCompletedPromises = sections.map(async (section: Section & { words: Word[] }) => {
      if (section.words.length === 0) {
        return false;
      }
      const learnedWordsCount = await db.userProgress.count({
        where: {
          userId: userId,
          word: {
            sectionId: section.id,
          },
          isManuallyLearned: true,
        },
      });
      return learnedWordsCount === section.words.length;
    });

    const sectionsCompletedResults = await Promise.all(sectionsCompletedPromises);
    const sectionsCompleted = sectionsCompletedResults.filter(Boolean).length;

    // Placeholder for study streak
    const studyStreak = 0;

    return NextResponse.json({
      wordsLearned,
      sectionsCompleted,
      studyStreak,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}