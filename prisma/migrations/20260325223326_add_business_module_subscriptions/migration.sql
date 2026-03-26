-- CreateEnum
CREATE TYPE "AppModule" AS ENUM ('FEEDBACK', 'REVIEWS', 'MESSAGING');

-- CreateEnum
CREATE TYPE "ModuleSubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'INACTIVE');

-- CreateTable
CREATE TABLE "BusinessModuleSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "module" "AppModule" NOT NULL,
    "status" "ModuleSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessModuleSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessModuleSubscription_businessId_status_idx" ON "BusinessModuleSubscription"("businessId", "status");

-- CreateIndex
CREATE INDEX "BusinessModuleSubscription_module_status_idx" ON "BusinessModuleSubscription"("module", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessModuleSubscription_businessId_module_key" ON "BusinessModuleSubscription"("businessId", "module");

-- AddForeignKey
ALTER TABLE "BusinessModuleSubscription" ADD CONSTRAINT "BusinessModuleSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
