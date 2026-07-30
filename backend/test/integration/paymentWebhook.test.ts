import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getPaymentMock = vi.hoisted(() => vi.fn());
const createCdekShipmentForPaidOrderMock = vi.hoisted(() => vi.fn());
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

vi.mock("../../src/services/cdek.service", () => ({
  createCdekShipmentForPaidOrder: createCdekShipmentForPaidOrderMock,
}));

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

describe("POST /api/payment/webhook/youkassa/:secret", () => {
  beforeEach(() => {
    getPaymentMock.mockReset();
    createCdekShipmentForPaidOrderMock.mockReset();
    createCdekShipmentForPaidOrderMock.mockResolvedValue(undefined);
  });

  test("обновляет успешную оплату и запускает создание отправления", async () => {
    const order = await createTestOrder();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        providerPaymentId: "provider-payment-1",
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
      id: "provider-payment-1",
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

    await request(app) // отправляем вебхук
      .post("/api/payment/webhook/youkassa/test-webhook-secret")
      .send({
        event: "payment.succeeded",
        object: {
          id: "provider-payment-1",
          status: "succeeded",
        },
      })
      .expect(200);

    const updatedPayment = await prisma.payment.findUnique({
      where: {
        id: payment.id,
      },
    });
    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(updatedPayment).toMatchObject({
      providerPaymentId: "provider-payment-1",
      status: "SUCCEEDED",
    });
    expect(updatedPayment?.paidAt).toBeInstanceOf(Date);
    expect(updatedOrder?.status).toBe("PAID");
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledTimes(1);
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledWith(order.id);
  });

  test("status check завершает успешный заказ, если webhook ещё не обработался", async () => {
    const order = await createTestOrder();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        providerPaymentId: "provider-payment-status-check",
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
      id: "provider-payment-status-check",
      status: "succeeded",
      paid: true,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    const response = await request(app)
      .get(`/api/payment/order/${order.id}/payment/${payment.id}/status`)
      .expect(200);

    expect(response.body).toMatchObject({
      orderId: order.id,
      paymentId: payment.id,
      orderStatus: "PAID",
      paymentStatus: "SUCCEEDED",
      isPaid: true,
    });

    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });
    const updatedPayment = await prisma.payment.findUnique({
      where: {
        id: payment.id,
      },
    });

    expect(updatedPayment).toMatchObject({
      providerPaymentId: "provider-payment-status-check",
      status: "SUCCEEDED",
    });
    expect(updatedOrder?.status).toBe("PAID");
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledTimes(1);
    expect(createCdekShipmentForPaidOrderMock).toHaveBeenCalledWith(order.id);
  });
});

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
    },
  });
}
