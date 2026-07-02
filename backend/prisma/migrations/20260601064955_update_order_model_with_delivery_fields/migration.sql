/*
  Warnings:

  - Added the required column `deliveryCityCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryCityLabel` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryOfficeAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryOfficeCode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('CDEK_PVZ', 'CDEK_POSTAMAT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCityCode" INTEGER NOT NULL,
ADD COLUMN     "deliveryCityLabel" TEXT NOT NULL,
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL,
ADD COLUMN     "deliveryOfficeAddress" TEXT NOT NULL,
ADD COLUMN     "deliveryOfficeCode" TEXT NOT NULL,
ADD COLUMN     "deliveryOfficeType" TEXT,
ADD COLUMN     "deliveryOfficeUuid" TEXT;
