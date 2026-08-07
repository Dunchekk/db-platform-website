-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "offerAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "offerVersion" TEXT,
ADD COLUMN     "personalDataConsentAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "personalDataConsentVersion" TEXT;
