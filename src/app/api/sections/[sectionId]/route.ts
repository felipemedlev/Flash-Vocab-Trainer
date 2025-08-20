import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await context.params;

  if (!sectionId) {
    return NextResponse.json(
      { message: "Missing section ID" },
      { status: 400 }
    );
  }

  try {
    const section = await db.section.findUnique({
      where: { id: parseInt(sectionId) },
    });

    if (!section) {
      return NextResponse.json({ message: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}