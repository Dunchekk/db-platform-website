/*
  Warnings:

  - Added the required column `packageHeightCm` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageLengthCm` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageWeightGrams` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageWidthCm` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageHeightCm` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageLengthCm` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageWeightGrams` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageWidthCm` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "packageHeightCm" INTEGER NOT NULL,
ADD COLUMN     "packageLengthCm" INTEGER NOT NULL,
ADD COLUMN     "packageWeightGrams" INTEGER NOT NULL,
ADD COLUMN     "packageWidthCm" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "packageHeightCm" INTEGER NOT NULL,
ADD COLUMN     "packageLengthCm" INTEGER NOT NULL,
ADD COLUMN     "packageWeightGrams" INTEGER NOT NULL,
ADD COLUMN     "packageWidthCm" INTEGER NOT NULL;
