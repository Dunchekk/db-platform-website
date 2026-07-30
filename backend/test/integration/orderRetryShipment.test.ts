import request from "supertest";
import { SignJWT } from "jose";
import { beforeEach, describe, expect, test, vi } from "vitest";

const createCdekShipmentForPaidOrderMock = vi.hoisted(() => vi.fn());

vi.mock("../../src/services/cdek.service", () => ({
  createCdekShipmentForPaidOrder: createCdekShipmentForPaidOrderMock,
}));

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

describe("POST /api/orders/:id/retry-shipment", () => {
  beforeEach(() => {
    createCdekShipmentForPaidOrderMock.mockReset();
  });

  test("отклоняет запрос без ADMIN роли", async () => {
    const order = await createTestOrder({ status: "PAID" });

    await request(app)
      .post(`/api/orders/${order.id}/retry-shipment`)
      .expect(401);

    expect(createCdekShipmentForPaidOrderMock).not.toHaveBeenCalled();
  });

  test("отклоняет неоплаченный заказ", async () => {
    const token = await createToken("ADMIN");
    const order = await createTestOrder({ status: "PENDING_PAYMENT" });

    const response = await request(app)
      .post(`/api/orders/${order.id}/retry-shipment`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(response.body).toEqual({
      message: "Shipment retry requires a paid order",
    });
    expect(createCdekShipmentForPaidOrderMock).not.toHaveBeenCalled();
  });

  test("перезапускает создание отправления для оплаченного заказа", async () => {
    const token = await createToken("ADMIN");
    const order = await createTestOrder({ status: "PAID" });
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: "FAILED",
      },
    });

    createCdekShipmentForPaidOrderMock.mockResolvedValue({
      ...shipment,
      status: "CREATED",
      providerShipmentId: "cdek-shipment-1",
      trackingNumber: "123456789",
    });

    const response = await request(app)
      .post(`/api/orders/${order.id}/retry-shipment`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: shipment.id,
      orderId: order.id,
      status: "CREATED",
      providerShipmentId: "cdek-shipment-1",
      trackingNumber: "123456789",
    });
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledTimes(1);
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledWith(order.id);
  });
});

async function createToken(role: string) {
  return new SignJWT({ role })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject("test-user")
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

async function createTestOrder({
  status,
}: {
  status: "PENDING_PAYMENT" | "PAID" | "FULFILLMENT_PENDING";
}) {
  const order = await prisma.order.create({
    data: {
      status,
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

  if (status !== "PENDING_PAYMENT") {
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        status: "SUCCEEDED",
        amount: order.total,
        providerPaymentId: `provider-payment-${order.id}`,
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
  }

  return order;
}
