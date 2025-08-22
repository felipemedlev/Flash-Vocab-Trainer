import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import * as xlsx from "xlsx";
import { isValidLanguageCode, getLanguageConfig } from "@/config/languages";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sectionName = formData.get("sectionName") as string;
    const language = formData.get("language") as string;
    const description = formData.get("description") as string;

    if (!file || !sectionName || !language) {
      return NextResponse.json(
        { message: "Missing file, section name, or language" },
        { status: 400 }
      );
    }

    // Validate language
    if (!isValidLanguageCode(language)) {
      return NextResponse.json(
        { message: "Invalid language code" },
        { status: 400 }
      );
    }

    const languageConfig = getLanguageConfig(language);
    if (!languageConfig) {
      return NextResponse.json(
        { message: "Language not supported" },
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
    const expectedLangHeader = languageConfig.name.toLowerCase();
    
    if (headers[0] !== expectedLangHeader && headers[0] !== "target" && headers[0] !== languageConfig.code) {
        return NextResponse.json(
            { message: `Invalid Excel format: First column must be '${languageConfig.name}', 'target', or '${languageConfig.code}'.` },
            { status: 400 }
        );
    }
    
    if (headers[1] !== "english" && headers[1] !== "translation") {
        return NextResponse.json(
            { message: "Invalid Excel format: Second column must be 'English' or 'translation'." },
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

    // Get language from database
    const languageRecord = await db.language.findUnique({
      where: { code: language }
    });

    if (!languageRecord) {
      return NextResponse.json(
        { message: "Language not found in database" },
        { status: 404 }
      );
    }

    const seenWords = new Set();
    const words = wordsData.map((row) => {
        const originalText = row[0] ? String(row[0]).trim() : "";
        const translationText = row[1] ? String(row[1]).trim() : "";
        const pronunciation = row[2] ? String(row[2]).trim() : undefined; // Optional third column

        if (!originalText || !translationText) {
            return null; // Invalid row, will be filtered out
        }

        const wordKey = `${originalText.toLowerCase()}|${translationText.toLowerCase()}`;
        if (seenWords.has(wordKey)) {
            // Duplicate word found, you might want to log this or handle it
            return null;
        }
        seenWords.add(wordKey);

        return {
            originalText,
            translationText,
            pronunciation,
            difficulty: 1, // Default difficulty
        };
    }).filter((word): word is NonNullable<typeof word> => word !== null);

    if (words.length === 0) {
        return NextResponse.json(
            { message: "No valid words found in the file. Please check the content." },
            { status: 400 }
        );
    }

    const newSection = await db.section.create({
      data: {
        name: sectionName,
        description: description || null,
        createdByUserId: parseInt(session.user.id),
        languageId: languageRecord.id,
        words: {
          create: words.map(word => ({
            ...word,
            languageId: languageRecord.id,
          })),
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Section created successfully", 
        section: newSection, 
        sectionId: newSection.id,
        wordsCount: words.length,
        language: {
          code: languageRecord.code,
          name: languageRecord.name
        }
      },
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