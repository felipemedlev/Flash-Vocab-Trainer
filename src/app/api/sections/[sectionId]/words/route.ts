import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sectionIdNum = parseInt(sectionId, 10);
    if (isNaN(sectionIdNum)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
    }

    // Check if the section exists and if the user has access to it
    const section = await db.section.findUnique({
      where: { id: sectionIdNum },
      select: {
        id: true,
        isDefault: true,
        createdByUserId: true,
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const userId = parseInt(session.user.id, 10);

    // Check if user has access to this section (either it's default or they created it)
    if (!section.isDefault && section.createdByUserId !== userId) {
      return NextResponse.json(
        { error: "You don't have access to this section" },
        { status: 403 }
      );
    }

    // Fetch words for the section
    const words = await db.word.findMany({
      where: { sectionId: sectionIdNum },
      select: {
        id: true,
        originalText: true,
        translationText: true,
        pronunciation: true,
      },
      orderBy: { originalText: 'asc' },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}