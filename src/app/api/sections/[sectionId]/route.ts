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
    console.log('Sections API called for sectionId:', sectionId, 'userId:', session.user.id);
    
    // Check if section exists at all first
    const allSections = await db.section.findMany({
      select: { id: true, name: true, isDefault: true, createdByUserId: true }
    });
    console.log('All sections in database:', allSections);
    
    // First get basic section info
    const section = await db.section.findFirst({
      where: { 
        id: parseInt(sectionId),
        OR: [
          { createdByUserId: parseInt(session.user.id) },
          { isDefault: true }
        ]
      },
    });

    console.log('Found section:', section);
    
    if (!section) {
      return NextResponse.json({ 
        message: "Section not found", 
        requestedId: sectionId,
        availableSections: allSections.map(s => ({ id: s.id, name: s.name, isDefault: s.isDefault }))
      }, { status: 404 });
    }

    // Get word count and progress separately for better performance
    const [totalWords, learnedWords] = await Promise.all([
      db.word.count({
        where: { sectionId: parseInt(sectionId) }
      }),
      db.userProgress.count({
        where: {
          word: { sectionId: parseInt(sectionId) },
          userId: parseInt(session.user.id),
          isManuallyLearned: true
        }
      })
    ]);

    const sectionWithProgress = {
      id: section.id,
      name: section.name,
      description: section.description,
      isDefault: section.isDefault,
      createdByUserId: section.createdByUserId,
      createdAt: section.createdAt,
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