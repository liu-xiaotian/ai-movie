-- CreateTable
CREATE TABLE "SubtitleEntry" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "translation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubtitleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubtitleEntry_projectId_idx" ON "SubtitleEntry"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtitleEntry_projectId_index_key" ON "SubtitleEntry"("projectId", "index");

-- AddForeignKey
ALTER TABLE "SubtitleEntry" ADD CONSTRAINT "SubtitleEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
