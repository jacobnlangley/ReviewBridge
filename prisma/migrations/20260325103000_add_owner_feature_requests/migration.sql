-- CreateTable
CREATE TABLE "OwnerFeatureRequest" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerFeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OwnerFeatureRequest_businessId_createdAt_idx" ON "OwnerFeatureRequest"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "OwnerFeatureRequest_ownerEmail_createdAt_idx" ON "OwnerFeatureRequest"("ownerEmail", "createdAt");

-- AddForeignKey
ALTER TABLE "OwnerFeatureRequest" ADD CONSTRAINT "OwnerFeatureRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
