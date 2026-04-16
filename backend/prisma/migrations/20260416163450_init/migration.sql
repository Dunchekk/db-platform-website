/*
  Warnings:

  - You are about to drop the column `order` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `Basket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BasketItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `position` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Basket" DROP CONSTRAINT "Basket_userId_fkey";

-- DropForeignKey
ALTER TABLE "BasketItem" DROP CONSTRAINT "BasketItem_basketId_fkey";

-- DropForeignKey
ALTER TABLE "BasketItem" DROP CONSTRAINT "BasketItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemImage" DROP CONSTRAINT "ItemImage_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemInfo" DROP CONSTRAINT "ItemInfo_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemPoint" DROP CONSTRAINT "ItemPoint_itemId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "order",
ADD COLUMN     "position" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Basket";

-- DropTable
DROP TABLE "BasketItem";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "patronymic" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "deliveryPrice" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "subtotal" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- AddForeignKey
ALTER TABLE "ItemPoint" ADD CONSTRAINT "ItemPoint_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInfo" ADD CONSTRAINT "ItemInfo_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemImage" ADD CONSTRAINT "ItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
