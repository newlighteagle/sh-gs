-- CreateEnum
CREATE TYPE "ImpactCategory" AS ENUM ('OUTCOME', 'OUTPUT', 'ACTIVITY');

-- CreateTable
CREATE TABLE "ImpactNode" (
    "id" TEXT NOT NULL,
    "category" "ImpactCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseline" TEXT,
    "intermediary" TEXT,
    "msa" TEXT,
    "type" TEXT,
    "lastChild" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,

    CONSTRAINT "ImpactNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpactNode_parentId_order_idx" ON "ImpactNode"("parentId", "order");

-- CreateIndex
CREATE INDEX "ImpactNode_category_parentId_idx" ON "ImpactNode"("category", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactNode_category_key_key" ON "ImpactNode"("category", "key");

-- AddForeignKey
ALTER TABLE "ImpactNode" ADD CONSTRAINT "ImpactNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ImpactNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
