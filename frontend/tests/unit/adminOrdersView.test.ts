import { describe, expect, test } from "vitest";
import { canRetryAdminOrderShipment } from "@/shared/helpers/adminOrdersView";
import type { AdminOrder } from "@/shared/types/admin-orders.types";

describe("canRetryAdminOrderShipment", () => {
  test.each([
    [
      "оплаченный заказ без отправления",
      buildAdminOrder({
        status: "PAID",
        shipment: null,
      }),
      true,
    ],
    [
      "успешная оплата и failed-отправление",
      buildAdminOrder({
        currentPayment: buildPayment({ status: "SUCCEEDED" }),
        shipment: buildShipment({ status: "FAILED" }),
      }),
      true,
    ],
    [
      "успешная оплата и canceled-отправление",
      buildAdminOrder({
        currentPayment: buildPayment({ status: "SUCCEEDED" }),
        shipment: buildShipment({ status: "CANCELED" }),
      }),
      true,
    ],
    [
      "успешная оплата и pending-отправление без трек-номера",
      buildAdminOrder({
        currentPayment: buildPayment({ status: "SUCCEEDED" }),
        shipment: buildShipment({ status: "PENDING", trackingNumber: null }),
      }),
      true,
    ],
    [
      "неоплаченный заказ без отправления",
      buildAdminOrder({
        status: "PENDING_PAYMENT",
        currentPayment: buildPayment({ status: "PENDING" }),
        shipment: null,
      }),
      false,
    ],
    [
      "успешная оплата и созданное отправление",
      buildAdminOrder({
        currentPayment: buildPayment({ status: "SUCCEEDED" }),
        shipment: buildShipment({
          status: "CREATED",
          trackingNumber: "123456789",
        }),
      }),
      false,
    ],
  ])("возвращает %j для кейса: %s", (_, order, expected) => {
    expect(canRetryAdminOrderShipment(order)).toBe(expected);
  });
});

function buildAdminOrder(overrides: Partial<AdminOrder> = {}): AdminOrder {
  return {
    id: 1,
    status: "PAID",
    firstName: "Anna",
    lastName: "Test",
    patronymic: null,
    email: "anna@example.com",
    phone: "+79991234567",
    telegram: null,
    deliveryMethod: "CDEK_PVZ",
    deliveryPrice: 300,
    deliveryCityLabel: "Москва",
    deliveryOfficeAddress: "Москва, тестовый адрес",
    comment: null,
    subtotal: 2000,
    total: 2300,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: [],
    currentPayment: buildPayment({ status: "SUCCEEDED" }),
    shipment: null,
    ...overrides,
  };
}

function buildPayment(
  overrides: Partial<NonNullable<AdminOrder["currentPayment"]>> = {}
): NonNullable<AdminOrder["currentPayment"]> {
  return {
    id: 1,
    status: "SUCCEEDED",
    amount: 2300,
    currency: "RUB",
    providerPaymentId: "provider-payment-1",
    paidAt: "2026-01-01T00:00:00.000Z",
    canceledAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildShipment(
  overrides: Partial<NonNullable<AdminOrder["shipment"]>> = {}
): NonNullable<AdminOrder["shipment"]> {
  return {
    id: 1,
    status: "CREATED",
    provider: "CDEK",
    providerShipmentId: "cdek-shipment-1",
    trackingNumber: "123456789",
    trackingUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
