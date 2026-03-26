-- AlterTable
ALTER TABLE "Business"
ADD COLUMN "autoRenewEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Business_autoRenewEnabled_idx" ON "Business"("autoRenewEnabled");
