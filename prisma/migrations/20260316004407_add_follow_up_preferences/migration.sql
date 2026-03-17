-- CreateEnum
CREATE TYPE "FollowUpPreference" AS ENUM ('TEXT', 'CALL', 'EMAIL');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "followUpPreference" "FollowUpPreference",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "wantsFollowUp" BOOLEAN NOT NULL DEFAULT false;
