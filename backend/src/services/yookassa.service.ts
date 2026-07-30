import { ICreatePayment } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { Order, Payment } from "@prisma/client";
import { YooCheckout } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { randomUUID } from "crypto";
import { prisma } from "../db";
import { shouldMarkProviderUnknown } from "../helpers/shouldMarkProviderUnknown";
import { OrderWithCurrentPayment } from "../types/checkout.types";
import { buildFrontendPaymentReturnUrl } from "../helpers/buildFrontendPaymentReturnUrl";

import { buildPaymentUpdateFromProvider } from "../helpers/buildPaymentUpdateFromProvider";
import { logEvents, logger } from "../lib/logger";
import { env } from "../config/env";
import {
  withTimeout,
  YOOKASSA_REQUEST_TIMEOUT_MS,
} from "../helpers/withTimeout";

const YOUKASSA_SECRET_KEY = env.YOUKASSA_SECRET_KEY;
const SHOP_ID = env.SHOP_ID;

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
    capture: true, // не нужно ручное подтверждение “подтвердить списание позже”
    payment_method_data: {
      type: "bank_card",
    },
    confirmation: {
      type: "redirect",
      return_url: buildFrontendPaymentReturnUrl(orderId, paymentId),
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

  // если активный платеж уже создан и есть ссылка на оплату, просто переиспользуем его
  if (
    existingPayment &&
    existingPayment.status === "PENDING" &&
    existingPayment.confirmationUrl
  ) {
    return existingPayment;
  }

  // успешный текущий платеж тоже не пересоздаем
  if (existingPayment && existingPayment.status === "SUCCEEDED") {
    return existingPayment;
  }

  // для неясного статуса сначала пробуем восстановить состояние у провайдера
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

  // создаем локальный payment, чтобы вернуть пользователя в правильный заказ после оплаты
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

  // payload для запроса создания платежа юкассы
  const createPayload = await CreatePayload(order, order.id, innerPayment.id);

  try {
    const providerPayment = await withTimeout(
      YouKassa.createPayment(createPayload, idempotenceKey),
      YOOKASSA_REQUEST_TIMEOUT_MS,
      "YooKassa create payment timed out"
    );

    innerPayment = await prisma.payment.update({
      where: { id: innerPayment.id },
      data: buildPaymentUpdateFromProvider(providerPayment),
    });

    logger.info(logEvents.paymentCreateSucceeded, {
      orderId: order.id,
      paymentId: innerPayment.id,
      providerPaymentId: innerPayment.providerPaymentId,
      paymentStatus: innerPayment.status,
    });

    return innerPayment;
  } catch (e) {
    // отдельный статус чтобы отличить явный отказ провайдера от неясного сетевого сбоя
    const failedStatus = shouldMarkProviderUnknown(e)
      ? "PROVIDER_UNKNOWN"
      : "FAILED";

    await prisma.payment.update({
      where: { id: innerPayment.id },
      data: {
        status: failedStatus,
      },
    });

    logger.error(logEvents.paymentCreateFailed, {
      orderId: order.id,
      paymentId: innerPayment.id,
      paymentStatus: failedStatus,
      err: e,
    });

    throw e;
  }
}

async function tryRestoreUnknownPayment(
  order: OrderWithCurrentPayment,
  payment: Payment
) {
  // без idempotence key повторно спросить провайдера о том же платеже не получится
  if (!payment.idempotenceKey) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  const createPayload = await CreatePayload(order, order.id, payment.id);

  try {
    const providerPayment = await withTimeout(
      YouKassa.createPayment(createPayload, payment.idempotenceKey),
      YOOKASSA_REQUEST_TIMEOUT_MS,
      "YooKassa restore payment timed out"
    );

    // если провайдер ответил успешно, просто синхронизируем локальный payment с его состоянием
    const restoredPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: buildPaymentUpdateFromProvider(providerPayment),
    });

    logger.info(logEvents.paymentRestoreUnknownSucceeded, {
      orderId: order.id,
      paymentId: restoredPayment.id,
      providerPaymentId: restoredPayment.providerPaymentId,
      paymentStatus: restoredPayment.status,
    });

    return restoredPayment;
  } catch (e) {
    // если провайдер снова не дал внятного ответа, оставляем payment в неопределенном состоянии
    if (shouldMarkProviderUnknown(e)) {
      return payment;
    }

    // если ответ однозначно плохой, фиксируем локальный payment как failed
    const failedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    logger.error(logEvents.paymentRestoreUnknownFailed, {
      orderId: order.id,
      paymentId: failedPayment.id,
      providerPaymentId: failedPayment.providerPaymentId,
      paymentStatus: failedPayment.status,
      err: e,
    });

    return failedPayment;
  }
}
