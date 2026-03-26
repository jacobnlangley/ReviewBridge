-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Business"
ADD COLUMN "instantEmailNeutral" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "instantEmailNegative" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "smsNegativeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "alertPhone" TEXT,
ADD COLUMN "quietHoursStart" TEXT,
ADD COLUMN "quietHoursEnd" TEXT;

-- AlterTable
ALTER TABLE "Feedback"
ADD COLUMN "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "firstViewedAt" TIMESTAMP(3),
ADD COLUMN "firstRespondedAt" TIMESTAMP(3),
ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "internalNotes" TEXT;

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "reason" TEXT,
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationEvent_feedbackId_createdAt_idx" ON "NotificationEvent"("feedbackId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_businessId_createdAt_idx" ON "NotificationEvent"("businessId", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
