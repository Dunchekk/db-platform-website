import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getPaymentMock = vi.hoisted(() => vi.fn());
const createCdekOrderMock = vi.hoisted(() => vi.fn());
const fetchCdekShipmentMock = vi.hoisted(() => vi.fn());
// hoisted - создать до выполнения vi.mock
// эти mock-и проверяются в expect, поэтому держим на них отдельные ссылки

vi.mock("../../src/services/yookassa.service", () => ({
  YouKassa: {
    getPayment: getPaymentMock,
    createPayment: vi.fn(),
  },
  CreatePayload: vi.fn(),
  resolveCheckoutPayment: vi.fn(),
}));

vi.mock("../../src/services/cdek.api", () => ({
  fetchCdek: vi.fn(),
  getCdekToken: vi.fn(),
  suggestCdekCities: vi.fn(),
  suggestCdekOffices: vi.fn(),
  suggestCdekDeliveryPrice: vi.fn(),
  createCdekOrder: createCdekOrderMock,
  fetchCdekShipment: fetchCdekShipmentMock,
}));

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

describe("POST /api/payment/webhook/youkassa/:secret idempotency", () => {
  beforeEach(() => {
    getPaymentMock.mockReset(); // сбрасывает fake-функцию в чистое состояние перед каждым тестом
    createCdekOrderMock.mockReset();
    fetchCdekShipmentMock.mockReset();

    createCdekOrderMock.mockResolvedValue({
      entity: {
        uuid: "cdek-shipment-1",
      },
      requests: [
        {
          type: "CREATE",
          date_time: "2026-01-01T00:00:00+00:00",
          state: "ACCEPTED",
        },
      ],
    });

    fetchCdekShipmentMock.mockResolvedValue({
      entity: {
        uuid: "cdek-shipment-1",
        cdek_number: 123456789,
        statuses: [
          {
            code: "CREATED",
          },
        ],
      },
      requests: [
        {
          type: "GET",
          date_time: "2026-01-01T00:00:00+00:00",
          state: "SUCCESSFUL",
        },
      ],
    });
  });

  test("не создаёт дубли отправления и email-задачи при повторном успешном webhook", async () => {
    const order = await createTestOrderWithItem();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        providerPaymentId: "provider-payment-repeat",
        confirmationUrl: "https://payment.example/confirm",
      },
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        currentPaymentId: payment.id,
      },
    });

    getPaymentMock.mockResolvedValue({
      id: "provider-payment-repeat",
      status: "succeeded",
      paid: true,
      metadata: {
        orderId: String(order.id),
        paymentId: String(payment.id),
      },
      amount: {
        value: String(order.total),
      },
    });

    const webhookPayload = {
      event: "payment.succeeded",
      object: {
        id: "provider-payment-repeat",
        status: "succeeded",
      },
    };

    await request(app)
      .post("/api/payment/webhook/youkassa/test-webhook-secret")
      .send(webhookPayload)
      .expect(200);

    await request(app)
      .post("/api/payment/webhook/youkassa/test-webhook-secret")
      .send(webhookPayload)
      .expect(200);

    const [shipmentsCount, notificationJobsCount] = await Promise.all([
      prisma.shipment.count(),
      prisma.notificationJob.count(),
    ]);

    expect(shipmentsCount).toBe(1);
    expect(notificationJobsCount).toBe(1);
    expect(createCdekOrderMock).toHaveBeenCalledTimes(1);
  });
});

async function createTestOrderWithItem() {
  const item = await prisma.item.create({
    data: {
      name: "Test item",
      price: 1000,
      position: 1,
      packageWeightGrams: 500,
      packageLengthCm: 20,
      packageWidthCm: 10,
      packageHeightCm: 5,
    },
  });

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
            itemId: item.id,
            title: item.name,
            price: item.price,
            quantity: 2,
            total: 2000,
            packageWeightGrams: item.packageWeightGrams,
            packageLengthCm: item.packageLengthCm,
            packageWidthCm: item.packageWidthCm,
            packageHeightCm: item.packageHeightCm,
          },
        ],
      },
    },
  });
}
