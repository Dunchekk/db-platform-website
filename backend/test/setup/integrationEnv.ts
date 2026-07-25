import { afterAll, beforeAll, beforeEach } from "vitest";

let prisma: typeof import("../../src/db").prisma;

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for integration tests");
}

if (!/test/i.test(testDatabaseUrl)) {
  throw new Error("TEST_DATABASE_URL must point to a test database");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.ADMIN_EMAIL ??= "admin@example.com";
process.env.ADMIN_PASSWORD_HASH ??= "test-password-hash";
process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.CORS_ORIGINS ??= "http://localhost:8080";
process.env.YOUKASSA_WEBHOOK_SECRET ??= "test-webhook-secret";
process.env.SHOP_ID ??= "test-shop-id";
process.env.YOUKASSA_SECRET_KEY ??= "test-yookassa-secret";
process.env.FRONTEND_RETURN_URL ??= "http://localhost:8080";
process.env.CDEK_BASE_URL ??= "http://localhost:5001";
process.env.CDEK_CLIENT_ID ??= "test-cdek-client-id";
process.env.CDEK_CLIENT_SECRET ??= "test-cdek-client-secret";
process.env.CDEK_COUNTRY_CODE ??= "RU";
process.env.MAIL_USER ??= "test@example.com";
process.env.MAIL_APP_PASSWORD ??= "test-mail-password";

beforeAll(async () => {
  ({ prisma } = await import("../../src/db"));
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.order.updateMany({
    data: {
      currentPaymentId: null,
    },
  });
  await prisma.notificationJob.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.itemPoint.deleteMany();
  await prisma.itemInfo.deleteMany();
  await prisma.item.deleteMany();
  await prisma.admin.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
