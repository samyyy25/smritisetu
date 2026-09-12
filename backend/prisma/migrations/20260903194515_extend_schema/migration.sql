/*
  Warnings:

  - You are about to drop the column `age` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosisStage` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `preferredName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `CaregiverAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoryPrompt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaregiverAlert" DROP CONSTRAINT "CaregiverAlert_patientId_fkey";

-- DropForeignKey
ALTER TABLE "MemoryLog" DROP CONSTRAINT "MemoryLog_patientId_fkey";

-- DropForeignKey
ALTER TABLE "MemoryLog" DROP CONSTRAINT "MemoryLog_promptId_fkey";

-- DropForeignKey
ALTER TABLE "MemoryPrompt" DROP CONSTRAINT "MemoryPrompt_patientId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "age",
DROP COLUMN "diagnosisStage",
DROP COLUMN "notes",
DROP COLUMN "preferredName",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "syntheticProfile" TEXT;

-- DropTable
DROP TABLE "CaregiverAlert";

-- DropTable
DROP TABLE "MemoryLog";

-- DropTable
DROP TABLE "MemoryPrompt";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "questionId" TEXT,
    "responseTimeMs" INTEGER NOT NULL,
    "sessionDurationMs" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "answerChanges" INTEGER NOT NULL DEFAULT 0,
    "difficultyLevel" TEXT NOT NULL DEFAULT 'easy',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" TEXT,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "personName" TEXT,
    "relationship" TEXT,
    "year" TEXT,
    "place" TEXT,
    "description" TEXT,
    "voiceNoteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "reasonText" TEXT NOT NULL,
    "metricChangesJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_patientId_timestamp_idx" ON "GameSession"("patientId", "timestamp");

-- CreateIndex
CREATE INDEX "GameSession_patientId_gameType_idx" ON "GameSession"("patientId", "gameType");

-- CreateIndex
CREATE INDEX "Memory_patientId_idx" ON "Memory"("patientId");

-- CreateIndex
CREATE INDEX "Alert_patientId_createdAt_idx" ON "Alert"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "Caregiver_patientId_idx" ON "Caregiver"("patientId");

-- CreateIndex
CREATE INDEX "DailyRoutine_patientId_idx" ON "DailyRoutine"("patientId");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
