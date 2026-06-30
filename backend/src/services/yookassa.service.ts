import { ICreatePayment } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { Order, Payment } from "@prisma/client";
import { YooCheckout } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { randomUUID } from "crypto";
import { prisma } from "../db";
import { shouldMarkProviderUnknown } from "../helpers/shouldMarkProviderUnknown";
import { OrderWithCurrentPayment } from "../types/checkout.types";

import "dotenv";
import { buildPaymentUpdateFromProvider } from "../helpers/buildPaymentUpdateFromProvider";

const YOUKASSA_SECRET_KEY = process.env.YOUKASSA_SECRET_KEY as string;
const SHOP_ID = process.env.SHOP_ID as string;

export const YouKassa = new YooCheckout({
  shopId: SHOP_ID,
  secretKey: YOUKASSA_SECRET_KEY,
});

export function CreatePayload(
  order: Order,
  orderId: number,
  paymentId: number
) {
  return {
    amount: {
      value: String(order.total) + ".00",
      currency: "RUB",
    },
    capture: true, // не нужна ручная стадия “подтвердить списание позже”
    payment_method_data: {
      type: "bank_card",
    },
    confirmation: {
      type: "redirect",
      return_url: process.env.FRONTEND_RETURN_URL,
    },
    metadata: {
      time: Date.now().toString(),
      orderId,
      paymentId,
    },
  } as ICreatePayment;
}

export async function resolveCheckoutPayment(order: OrderWithCurrentPayment) {
  const existingPayment = order.currentPayment;

  if (
    existingPayment &&
    existingPayment.status === "PENDING" &&
    existingPayment.confirmationUrl
  ) {
    return existingPayment;
  }

  if (existingPayment && existingPayment.status === "SUCCEEDED") {
    return existingPayment;
  }

  if (existingPayment && existingPayment.status === "PROVIDER_UNKNOWN") {
    const restoredPayment = await tryRestoreUnknownPayment(
      order,
      existingPayment
    );

    if (
      restoredPayment.status === "PENDING" &&
      restoredPayment.confirmationUrl
    ) {
      return restoredPayment;
    }

    if (restoredPayment.status === "SUCCEEDED") {
      return restoredPayment;
    }
  }

  return createNewPaymentForOrder(order);
}

async function createNewPaymentForOrder(order: OrderWithCurrentPayment) {
  const idempotenceKey = randomUUID();

  let innerPayment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: order.total,
      idempotenceKey,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { currentPaymentId: innerPayment.id },
  });

  const createPayload = await CreatePayload(order, order.id, innerPayment.id);

  try {
    const providerPayment = await YouKassa.createPayment(
      createPayload,
      idempotenceKey
    );

    innerPayment = await prisma.payment.update({
      where: { id: innerPayment.id },
      data: buildPaymentUpdateFromProvider(providerPayment),
    });

    return innerPayment;
  } catch (e) {
    await prisma.payment.update({
      where: { id: innerPayment.id },
      data: {
        status: shouldMarkProviderUnknown(e) ? "PROVIDER_UNKNOWN" : "FAILED",
      },
    });

    throw e;
  }
}

async function tryRestoreUnknownPayment(
  order: OrderWithCurrentPayment,
  payment: Payment
) {
  if (!payment.idempotenceKey) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  const createPayload = await CreatePayload(order, order.id, payment.id);

  try {
    const providerPayment = await YouKassa.createPayment(
      createPayload,
      payment.idempotenceKey
    );

    return prisma.payment.update({
      where: { id: payment.id },
      data: buildPaymentUpdateFromProvider(providerPayment),
    });
  } catch (e) {
    if (shouldMarkProviderUnknown(e)) {
      return payment;
    }

    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }
}
