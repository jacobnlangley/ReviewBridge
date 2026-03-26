-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL_ACTIVE', 'ACTIVE_PAID', 'INACTIVE_EXPIRED', 'INACTIVE_CANCELED');

-- AlterTable
ALTER TABLE "Business"
ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL_ACTIVE',
ADD COLUMN "trialStartedAt" TIMESTAMP(3),
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "paidThrough" TIMESTAMP(3),
ADD COLUMN "deactivatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Business_subscriptionStatus_idx" ON "Business"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "Business_trialEndsAt_idx" ON "Business"("trialEndsAt");

-- CreateIndex
CREATE INDEX "Business_paidThrough_idx" ON "Business"("paidThrough");
