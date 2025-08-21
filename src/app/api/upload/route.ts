import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import * as xlsx from "xlsx";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sectionName = formData.get("sectionName") as string;

    if (!file || !sectionName) {
      return NextResponse.json(
        { message: "Missing file or section name" },
        { status: 400 }
      );
    }

    // File size validation (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { status: 413 }
      );
    }

    // File type validation
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        return NextResponse.json(
            { message: "Invalid file type. Please upload an .xlsx or .xls file." },
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (!data || data.length < 2) {
      return NextResponse.json(
        { message: "Invalid Excel format: File must contain a header row and at least one word." },
        { status: 400 }
      );
    }

    const headers = data[0].map(header => header.trim().toLowerCase());
    if (headers[0] !== "hebrew" || headers[1] !== "english") {
        return NextResponse.json(
            { message: "Invalid Excel format: Headers must be 'Hebrew' and 'English' in the first two columns." },
            { status: 400 }
        );
    }

    const wordsData = data.slice(1).filter(row => row.length > 1 && row[0] && row[1]);

    if (wordsData.length > 500) {
        return NextResponse.json(
            { message: "Upload limit is 500 words per file." },
            { status: 400 }
        );
    }

    const seenWords = new Set();
    const words = wordsData.map((row) => {
        const hebrewText = row[0] ? String(row[0]).trim() : "";
        const englishTranslation = row[1] ? String(row[1]).trim() : "";

        if (!hebrewText || !englishTranslation) {
            return null; // Invalid row, will be filtered out
        }

        const wordKey = `${hebrewText.toLowerCase()}|${englishTranslation.toLowerCase()}`;
        if (seenWords.has(wordKey)) {
            // Duplicate word found, you might want to log this or handle it
            return null;
        }
        seenWords.add(wordKey);

        return {
            hebrewText,
            englishTranslation,
        };
    }).filter((word): word is { hebrewText: string; englishTranslation: string } => word !== null);

    if (words.length === 0) {
        return NextResponse.json(
            { message: "No valid words found in the file. Please check the content." },
            { status: 400 }
        );
    }

    const newSection = await db.section.create({
      data: {
        name: sectionName,
        createdByUserId: parseInt(session.user.id),
        words: {
          create: words,
        },
      },
    });

    return NextResponse.json(
      { message: "Section created successfully", section: newSection, sectionId: newSection.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}