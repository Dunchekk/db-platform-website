import { describe, expect, test, vi, beforeEach } from "vitest";

const sendConfirmationOrderMailMock = vi.hoisted(() => vi.fn());

vi.mock("../../src/services/mail.service", () => ({
  sendConfirmationOrderMail: sendConfirmationOrderMailMock,
}));

const { prisma } = await import("../../src/db");
const {
  claimNextNotificationJob,
  markNotificationJobFailed,
  markNotificationJobSent,
  processNotificationJob,
} = await import("../../src/services/notification-job.service");

describe("notification job service", () => {
  beforeEach(() => {
    sendConfirmationOrderMailMock.mockReset();
  });

  test("забирает ближайшую pending-задачу в работу", async () => {
    const laterJob = await createNotificationJob({
      runAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    const earlierJob = await createNotificationJob({
      runAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const claimedJob = await claimNextNotificationJob();

    expect(claimedJob?.id).toBe(earlierJob.id);

    const [earlierJobAfterClaim, laterJobAfterClaim] = await Promise.all([
      prisma.notificationJob.findUnique({
        where: {
          id: earlierJob.id,
        },
      }),
      prisma.notificationJob.findUnique({
        where: {
          id: laterJob.id,
        },
      }),
    ]);

    expect(earlierJobAfterClaim).toMatchObject({
      status: "PROCESSING",
    });
    expect(earlierJobAfterClaim?.lockedAt).toBeInstanceOf(Date);
    expect(laterJobAfterClaim).toMatchObject({
      status: "PENDING",
      lockedAt: null,
    });
  });

  test("помечает обработанную задачу как отправленную", async () => {
    const job = await createNotificationJob({
      status: "PROCESSING",
      lockedAt: new Date("2026-01-01T00:00:00.000Z"),
      lastError: "Previous SMTP error",
    });

    await markNotificationJobSent(job.id);

    const sentJob = await prisma.notificationJob.findUnique({
      where: {
        id: job.id,
      },
    });

    expect(sentJob).toMatchObject({
      status: "SENT",
      attempts: 0,
      lockedAt: null,
      lastError: null,
    });
    expect(sentJob?.sentAt).toBeInstanceOf(Date);
  });

  test("возвращает задачу в retry, а после третьей ошибки помечает failed", async () => {
    const job = await createNotificationJob({
      status: "PROCESSING",
      lockedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await markNotificationJobFailed(job.id, new Error("SMTP unavailable"));

    const firstRetryJob = await prisma.notificationJob.findUnique({
      where: {
        id: job.id,
      },
    });

    expect(firstRetryJob).toMatchObject({
      status: "PENDING",
      attempts: 1,
      lockedAt: null,
      lastError: "SMTP unavailable",
    });

    await markNotificationJobFailed(job.id, new Error("SMTP unavailable"));
    await markNotificationJobFailed(job.id, new Error("SMTP unavailable"));

    const failedJob = await prisma.notificationJob.findUnique({
      where: {
        id: job.id,
      },
    });

    expect(failedJob).toMatchObject({
      status: "FAILED",
      attempts: 3,
      lockedAt: null,
      lastError: "SMTP unavailable",
    });
  });

  test("обработка задачи запускает отправку письма по заказу", async () => {
    const order = await createTestOrder();

    sendConfirmationOrderMailMock.mockResolvedValue(undefined);

    await processNotificationJob({
      id: 1,
      orderId: order.id,
      shipmentId: null,
      type: "SHIPMENT_CREATED_EMAIL",
      attempts: 0,
    });

    expect(sendConfirmationOrderMailMock).toHaveBeenCalledTimes(1);
    expect(sendConfirmationOrderMailMock).toHaveBeenCalledWith(order.id);
  });
});

async function createNotificationJob({
  status = "PENDING",
  runAt = new Date(),
  lockedAt = null,
  lastError = null,
}: {
  status?: "PENDING" | "PROCESSING" | "SENT" | "FAILED";
  runAt?: Date;
  lockedAt?: Date | null;
  lastError?: string | null;
} = {}) {
  const order = await createTestOrder();
  const shipment = await prisma.shipment.create({
    data: {
      orderId: order.id,
      status: "CREATED",
      providerShipmentId: `cdek-${order.id}`,
      trackingNumber: `track-${order.id}`,
      trackingUrl: `https://track.example/${order.id}`,
    },
  });

  return prisma.notificationJob.create({
    data: {
      type: "SHIPMENT_CREATED_EMAIL",
      status,
      orderId: order.id,
      shipmentId: shipment.id,
      runAt,
      lockedAt,
      lastError,
    },
  });
}

function createTestOrder() {
  return prisma.order.create({
    data: {
      firstName: "Anna",
      lastName: "Test",
      patronymic: "",
      email: "anna@example.com",
      phone: "+79991234567",
      telegram: "@anna",
      deliveryMethod: "CDEK_PVZ",
      deliveryPrice: 300,
      deliveryCityCode: 44,
      deliveryCityLabel: "Москва",
      deliveryOfficeCode: "PVZ-1",
      deliveryOfficeUuid: "office-uuid",
      deliveryOfficeType: "PVZ",
      deliveryOfficeAddress: "Москва, тестовый адрес",
      comment: "Позвонить перед доставкой",
      subtotal: 2000,
      total: 2300,
      items: {
        create: [
          {
            title: "Test item",
            price: 1000,
            quantity: 2,
            total: 2000,
            packageWeightGrams: 500,
            packageLengthCm: 20,
            packageWidthCm: 10,
            packageHeightCm: 5,
          },
        ],
      },
    },
  });
}
