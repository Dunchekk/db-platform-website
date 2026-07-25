import { describe, expect, test } from "vitest";
import { buildPaymentUpdateFromProvider } from "../../src/helpers/buildPaymentUpdateFromProvider";

describe("buildPaymentUpdateFromProvider", () => {
  test("создаёт update для успешной оплаты", () => {
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
      confirmationUrl: "https://payment.example/confirm",
      status: "SUCCEEDED",
      paidAt: expect.any(Date),
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
