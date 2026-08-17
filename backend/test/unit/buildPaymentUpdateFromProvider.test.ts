import { describe, expect, test } from "vitest";
import { buildPaymentUpdateFromProvider } from "../../src/helpers/buildPaymentUpdateFromProvider";

describe("buildPaymentUpdateFromProvider", () => {
  test("создаёт update для успешной оплаты и очищает ссылку на оплату", () => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status: "succeeded",
      paid: true,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    expect(update).toEqual({
      providerPaymentId: "provider-payment-1",
      confirmationUrl: null,
      status: "SUCCEEDED",
      paidAt: expect.any(Date),
    });
  });

  test("сохраняет confirmationUrl для ожидающего платежа", () => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status: "pending",
      paid: false,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    expect(update).toMatchObject({
      confirmationUrl: "https://payment.example/confirm",
      status: "PENDING",
    });
  });

  test.each([
    ["pending", "PENDING"],
    ["waiting_for_capture", "PENDING"],
    ["canceled", "CANCELED"],
    ["unknown", "PENDING"],
  ])("преобразует статус провайдера %j в локальный статус %j", (status, expected) => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status,
      paid: false,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    expect(update.status).toBe(expected);
  });

  test("возвращает null для confirmationUrl, если ссылка отсутствует", () => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status: "pending",
      paid: false,
      confirmation: {},
    });

    expect(update.confirmationUrl).toBeNull();
  });

  test("очищает confirmationUrl для отменённого платежа", () => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status: "canceled",
      paid: false,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    expect(update).toMatchObject({
      confirmationUrl: null,
      status: "CANCELED",
    });
  });

  test("возвращает null для paidAt, если оплата не проведена", () => {
    const update = buildPaymentUpdateFromProvider({
      id: "provider-payment-1",
      status: "pending",
      paid: false,
      confirmation: {
        confirmation_url: "https://payment.example/confirm",
      },
    });

    expect(update.paidAt).toBeNull();
  });
});
