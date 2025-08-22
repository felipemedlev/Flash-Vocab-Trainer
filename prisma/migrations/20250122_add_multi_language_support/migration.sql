-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "isRTL" BOOLEAN NOT NULL DEFAULT false,
    "fontFamily" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- Insert supported languages
INSERT INTO "Language" ("code", "name", "nativeName", "isRTL", "fontFamily", "isActive") VALUES
('he', 'Hebrew', 'עברית', true, '''Assistant'', ''Rubik'', ''Noto Sans Hebrew'', sans-serif', true),
('es', 'Spanish', 'Español', false, '''Inter'', sans-serif', true),
('fr', 'French', 'Français', false, '''Inter'', sans-serif', true),
('it', 'Italian', 'Italiano', false, '''Inter'', sans-serif', true),
('de', 'German', 'Deutsch', false, '''Inter'', sans-serif', true),
('ru', 'Russian', 'Русский', false, '''Noto Sans Cyrillic'', sans-serif', true),
('zh', 'Chinese', '中文', false, '''Noto Sans SC'', sans-serif', true),
('pt', 'Portuguese', 'Português', false, '''Inter'', sans-serif', true),
('ja', 'Japanese', '日本語', false, '''Noto Sans JP'', sans-serif', true);

-- Add languageId column to Section table
ALTER TABLE "Section" ADD COLUMN "languageId" INTEGER;

-- Add languageId column to Word table
ALTER TABLE "Word" ADD COLUMN "languageId" INTEGER;

-- Add new word fields
ALTER TABLE "Word" ADD COLUMN "originalText" TEXT;
ALTER TABLE "Word" ADD COLUMN "translationText" TEXT;
ALTER TABLE "Word" ADD COLUMN "pronunciation" TEXT;
ALTER TABLE "Word" ADD COLUMN "difficulty" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Word" ADD COLUMN "audioUrl" TEXT;
ALTER TABLE "Word" ADD COLUMN "imageUrl" TEXT;

-- Migrate existing data to Hebrew language (assuming existing data is Hebrew)
UPDATE "Section" SET "languageId" = (SELECT "id" FROM "Language" WHERE "code" = 'he' LIMIT 1) WHERE "languageId" IS NULL;
UPDATE "Word" SET "languageId" = (SELECT "id" FROM "Language" WHERE "code" = 'he' LIMIT 1) WHERE "languageId" IS NULL;

-- Migrate existing word data
UPDATE "Word" SET "originalText" = "hebrewText", "translationText" = "englishTranslation" WHERE "originalText" IS NULL;

-- Make columns required after data migration
ALTER TABLE "Section" ALTER COLUMN "languageId" SET NOT NULL;
ALTER TABLE "Word" ALTER COLUMN "languageId" SET NOT NULL;
ALTER TABLE "Word" ALTER COLUMN "originalText" SET NOT NULL;
ALTER TABLE "Word" ALTER COLUMN "translationText" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Word" DROP COLUMN "hebrewText";
ALTER TABLE "Word" DROP COLUMN "englishTranslation";

-- Remove unique constraint on section name (now unique per language)
ALTER TABLE "Section" DROP CONSTRAINT "Section_name_key";

-- Add foreign key constraints
ALTER TABLE "Section" ADD CONSTRAINT "Section_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "Word_languageId_idx" ON "Word"("languageId");

-- Add unique constraint for section name per language
ALTER TABLE "Section" ADD CONSTRAINT "Section_name_languageId_key" UNIQUE ("name", "languageId");