import request from "supertest";
import { describe, expect, test, vi } from "vitest";

vi.mock("../../src/services/cdek.api", () => ({
  // подменяем весь модуль cdek.api
  fetchCdek: vi.fn(),
  getCdekToken: vi.fn(),
  suggestCdekCities: vi.fn(),
  suggestCdekOffices: vi.fn(),
  suggestCdekDeliveryPrice: vi.fn().mockResolvedValue({
    total_sum: 300,
  }),
  fetchCdekShipment: vi.fn(),
  createCdekOrder: vi.fn(),
}));

vi.mock("../../src/services/yookassa.service", () => ({
  YouKassa: {
    getPayment: vi.fn(),
    createPayment: vi.fn(),
  },
  CreatePayload: vi.fn(),
  resolveCheckoutPayment: vi.fn(
    async (order: {
      id: number;
      total: number;
      currentPayment?: {
        status: string;
        confirmationUrl: string | null;
      } | null;
    }) => {
      // если у заказа уже есть текущий PENDING payment с confirmationUrl,
      // переиспользовать его (реальное поведение)
      if (
        order.currentPayment?.status === "PENDING" &&
        order.currentPayment.confirmationUrl
      ) {
        return order.currentPayment;
      }

      const { prisma } = await import("../../src/db");
      const payment = await prisma.payment.create({
        // mock создает настоящий Payment в тестовой БД.
        data: {
          orderId: order.id,
          amount: order.total,
          providerPaymentId: `provider-payment-${order.id}`,
          idempotenceKey: `test-idempotence-${order.id}`,
          confirmationUrl: "https://payment.example/confirm",
        },
      });

      // в реальном коде это делает yookassa.service.ts
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          currentPaymentId: payment.id,
        },
      });

      return payment;
    }
  ),
}));

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

// пользователь нажал "оформить заказ"
// -> POST /api/checkout
// -> backend создал Order
// -> backend создал Payment
// -> backend вернул confirmationUrl
// -> frontend потом редиректнул бы пользователя на YooKassa

describe("POST /api/checkout", () => {
  test("создаёт заказ с позициями и платежом", async () => {
    const item = await createTestItem();

    const response = await request(app)
      .post("/api/checkout")
      .send(buildCheckoutPayload(item.id, "checkout-attempt-1"))
      .expect(200);

    expect(response.body).toEqual({
      orderId: expect.any(Number),
      paymentId: expect.any(Number),
      confirmationUrl: "https://payment.example/confirm",
      alreadyPaid: false,
    });

    const order = await prisma.order.findUnique({
      where: {
        id: response.body.orderId,
      },
      include: {
        items: true,
        currentPayment: true,
      },
    });

    expect(order).not.toBeNull();
    expect(order?.firstName).toBe("Anna");
    expect(order?.lastName).toBe("Test");
    expect(order?.email).toBe("anna@example.com");
    expect(order?.phone).toBe("+79991234567");
    expect(order?.telegram).toBe("@anna");
    expect(order?.comment).toBe("Позвонить перед доставкой");
    expect(order?.subtotal).toBe(2000);
    expect(order?.deliveryPrice).toBe(300);
    expect(order?.total).toBe(2300);
    expect(order?.deliveryMethod).toBe("CDEK_PVZ");
    expect(order?.deliveryCityCode).toBe(44);
    expect(order?.deliveryOfficeCode).toBe("PVZ-1");
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]).toMatchObject({
      itemId: item.id,
      title: "Test item",
      price: 1000,
      quantity: 2,
      total: 2000,
      packageWeightGrams: 500,
      packageLengthCm: 20,
      packageWidthCm: 10,
      packageHeightCm: 5,
    });
    expect(order?.currentPayment).toMatchObject({
      id: response.body.paymentId,
      amount: 2300,
      status: "PENDING",
      confirmationUrl: "https://payment.example/confirm",
    });
  });

  test("не создаёт дубль заказа при повторном checkoutAttemptKey", async () => {
    const item = await createTestItem();
    const payload = buildCheckoutPayload(item.id, "checkout-attempt-repeat");

    const firstResponse = await request(app)
      .post("/api/checkout")
      .send(payload)
      .expect(200);

    const secondResponse = await request(app)
      .post("/api/checkout")
      .send(payload)
      .expect(200);

    expect(secondResponse.body).toEqual(firstResponse.body);

    const [ordersCount, orderItemsCount, paymentsCount] = await Promise.all([
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.payment.count(),
    ]);

    expect(ordersCount).toBe(1);
    expect(orderItemsCount).toBe(1);
    expect(paymentsCount).toBe(1);
  });
});

// helpers ↓

function createTestItem() {
  return prisma.item.create({
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
}

function buildCheckoutPayload(itemId: number, checkoutAttemptKey: string) {
  return {
    checkoutAttemptKey,
    firstName: "Anna",
    lastName: "Test",
    patronymic: "",
    email: "anna@example.com",
    phone: "89991234567",
    telegram: "@anna",
    comment: "Позвонить перед доставкой",
    deliveryPrice: 300,
    subtotal: 2000,
    total: 2300,
    city: {
      uuid: "city-uuid",
      code: 44,
      label: "Москва",
      countryCode: "RU",
    },
    office: {
      code: "PVZ-1",
      uuid: "office-uuid",
      type: "PVZ",
      work_time: "10:00-20:00",
      phones: [],
      work_time_list: [],
      location: {
        country_code: "RU",
        region_code: 77,
        region: "Москва",
        city_code: 44,
        city: "Москва",
        longitude: 37.62,
        latitude: 55.75,
        address: "Тестовый адрес",
        address_full: "Москва, тестовый адрес",
        city_uuid: "city-uuid",
      },
    },
    items: [
      {
        itemId,
        quantity: 2,
      },
    ],
  };
}
