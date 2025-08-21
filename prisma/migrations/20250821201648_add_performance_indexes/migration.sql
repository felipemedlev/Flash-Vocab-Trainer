/*
  Warnings:

  - A unique constraint covering the columns `[userId,wordId]` on the table `UserProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "public"."UserProgress"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_wordId_idx" ON "public"."UserProgress"("wordId");

-- CreateIndex
CREATE INDEX "UserProgress_nextReviewDate_idx" ON "public"."UserProgress"("nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_wordId_key" ON "public"."UserProgress"("userId", "wordId");

-- CreateIndex
CREATE INDEX "Word_sectionId_idx" ON "public"."Word"("sectionId");
