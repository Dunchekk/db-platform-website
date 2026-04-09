-- CreateTable
CREATE TABLE "ItemPoint" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "point" TEXT NOT NULL,

    CONSTRAINT "ItemPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemPoint_itemId_idx" ON "ItemPoint"("itemId");

-- AddForeignKey
ALTER TABLE "ItemPoint" ADD CONSTRAINT "ItemPoint_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
