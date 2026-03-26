-- CreateTable
CREATE TABLE "ValidationEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "businessId" TEXT,
    "locationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ValidationEvent_event_createdAt_idx" ON "ValidationEvent"("event", "createdAt");

-- CreateIndex
CREATE INDEX "ValidationEvent_businessId_createdAt_idx" ON "ValidationEvent"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "ValidationEvent_locationId_createdAt_idx" ON "ValidationEvent"("locationId", "createdAt");

-- AddForeignKey
ALTER TABLE "ValidationEvent" ADD CONSTRAINT "ValidationEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationEvent" ADD CONSTRAINT "ValidationEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
