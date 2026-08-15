import { describe, expect, test, vi } from "vitest";
import { prisma } from "../../src/db";
import { runRetentionCleanup } from "../../src/services/retention.service";
import { ProviderPaymentResult } from "../../src/types/checkout.types";

const NOW = new Date("2026-08-15T00:00:00.000Z");
const OLD = new Date("2026-07-01T00:00:00.000Z");
const FRESH = new Date("2026-08-01T00:00:00.000Z");
const OLD_COMPLETED = new Date("2025-08-14T00:00:00.000Z");

describe("retention cleanup service", () => {
  test("dry-run считает подходящие изменения, но не меняет данные", async () => {
    const order = await createOrder("PENDING_PAYMENT", OLD);
    const payment = await createPayment(order.id, "CANCELED", {
      confirmationUrl: "https://payment.example/confirm",
      createdAt: OLD,
    });

    const summary = await runRetentionCleanup({ dryRun: true, now: NOW });

    expect(summary).toMatchObject({
      oldPendingOrdersDeleted: 1,
      paymentConfirmationUrlsCleared: 1,
    });
    await expect(prisma.order.findUnique({ where: { id: order.id } })).resolves
      .not.toBeNull();
    await expect(prisma.payment.findUnique({ where: { id: payment.id } }))
      .resolves.toMatchObject({
        confirmationUrl: "https://payment.example/confirm",
      });
  });

  test("удаляет старые неоплаченные заказы, но сохраняет оплаченные и успешные у провайдера", async () => {
    const oldUnpaidOrder = await createOrder("PENDING_PAYMENT", OLD);
    const freshOrder = await createOrder("PENDING_PAYMENT", FRESH);
    const paidOrder = await createOrder("PENDING_PAYMENT", OLD);
    await createPayment(paidOrder.id, "SUCCEEDED", { createdAt: OLD });

    const providerSucceededOrder = await createOrder("PENDING_PAYMENT", OLD);
    const providerPayment = await createPayment(
      providerSucceededOrder.id,
      "PENDING",
      {
        providerPaymentId: "provider-payment-1",
        createdAt: OLD,
      }
    );
    await prisma.order.update({
      where: { id: providerSucceededOrder.id },
      data: { currentPaymentId: providerPayment.id },
    });

    const getProviderPayment = vi
      .fn<() => Promise<ProviderPaymentResult>>()
      .mockResolvedValue({
        id: "provider-payment-1",
        status: "succeeded",
        paid: true,
        confirmation: {},
      });

    const summary = await runRetentionCleanup({
      dryRun: false,
      now: NOW,
      getProviderPayment,
    });

    expect(summary).toMatchObject({
      oldPendingOrdersDeleted: 1,
      ordersSkippedProviderSucceeded: 1,
    });
    await expect(prisma.order.findUnique({ where: { id: oldUnpaidOrder.id } }))
      .resolves.toBeNull();
    await expect(prisma.order.findUnique({ where: { id: freshOrder.id } }))
      .resolves.not.toBeNull();
    await expect(prisma.order.findUnique({ where: { id: paidOrder.id } }))
      .resolves.not.toBeNull();
    await expect(
      prisma.order.findUnique({ where: { id: providerSucceededOrder.id } })
    ).resolves.not.toBeNull();
  });

  test("очищает хранимые персональные и операционные поля", async () => {
    const order = await createOrder("DELIVERED", OLD_COMPLETED, {
      completedAt: OLD_COMPLETED,
      comment: "Old comment",
      telegram: "@old",
    });
    const payment = await createPayment(order.id, "SUCCEEDED", {
      confirmationUrl: "https://payment.example/terminal",
      createdAt: FRESH,
    });
    const job = await prisma.notificationJob.create({
      data: {
        type: "SHIPMENT_CREATED_EMAIL",
        status: "FAILED",
        orderId: order.id,
        updatedAt: OLD,
        lastError: "SMTP unavailable",
      },
    });

    const summary = await runRetentionCleanup({ dryRun: false, now: NOW });

    expect(summary).toMatchObject({
      paymentConfirmationUrlsCleared: 1,
      orderCommentsCleared: 1,
      orderTelegramsCleared: 1,
      notificationJobErrorsCleared: 1,
    });
    await expect(prisma.order.findUnique({ where: { id: order.id } }))
      .resolves.toMatchObject({ comment: null, telegram: null });
    await expect(prisma.payment.findUnique({ where: { id: payment.id } }))
      .resolves.toMatchObject({ confirmationUrl: null });
    await expect(prisma.notificationJob.findUnique({ where: { id: job.id } }))
      .resolves.toMatchObject({ lastError: null });
  });
});

function createOrder(
  status: "PENDING_PAYMENT" | "DELIVERED",
  createdAt: Date,
  overrides: {
    completedAt?: Date | null;
    comment?: string | null;
    telegram?: string | null;
  } = {}
) {
  return prisma.order.create({
    data: {
      status,
      firstName: "Anna",
      lastName: "Test",
      patronymic: "",
      email: "anna@example.com",
      phone: "+79991234567",
      telegram: overrides.telegram ?? "@test",
      deliveryMethod: "CDEK_PVZ",
      deliveryPrice: 300,
      deliveryCityCode: 44,
      deliveryCityLabel: "Москва",
      deliveryOfficeCode: "PVZ-1",
      deliveryOfficeAddress: "Москва, тестовый адрес",
      comment: overrides.comment ?? "Test comment",
      subtotal: 2000,
      total: 2300,
      createdAt,
      completedAt: overrides.completedAt ?? null,
    },
  });
}

function createPayment(
  orderId: number,
  status: "PENDING" | "SUCCEEDED" | "CANCELED",
  overrides: {
    confirmationUrl?: string | null;
    providerPaymentId?: string | null;
    createdAt: Date;
  }
) {
  return prisma.payment.create({
    data: {
      orderId,
      status,
      amount: 2300,
      confirmationUrl: overrides.confirmationUrl ?? null,
      providerPaymentId: overrides.providerPaymentId ?? null,
      createdAt: overrides.createdAt,
    },
  });
}
