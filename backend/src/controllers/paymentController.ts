import type { NextFunction, Request, Response } from "express";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";
import { prisma } from "../db";
import { YouKassa } from "../services/yookassa.service";
import { createCdekShipmentForPaidOrder } from "../services/cdek.service";
import { CheckOrderStatusParams } from "../types/checkout.types";
import ApiError from "../error/ApiError";
import { buildPaymentUpdateFromProvider } from "../helpers/buildPaymentUpdateFromProvider";
import { logEvents, logger } from "../lib/logger";
import {
  withTimeout,
  YOOKASSA_REQUEST_TIMEOUT_MS,
} from "../helpers/withTimeout";

class PaymentController {
  async handleYouKassaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { event, object } = req.body;

      logger.info(logEvents.paymentWebhookReceived, {
        event,
        providerPaymentId: object?.id,
        providerStatus: object?.status,
      });

      // отсекаем пустой или битый вебхук
      if (!event || !object?.id) {
        logger.warn(logEvents.paymentWebhookIgnoredInvalid, {
          event,
          providerPaymentId: object?.id,
        });
        return res.sendStatus(200);
      }

      // ищем платеж по id провайдера
      let innerPayment = await prisma.payment.findFirst({
        where: {
          providerPaymentId: object.id,
        },
      });

      // запрашиваем актуальный статус у провайдера
      const actualPayment = await withTimeout(
        YouKassa.getPayment(object.id),
        YOOKASSA_REQUEST_TIMEOUT_MS,
        "YooKassa get payment timed out"
      );

      if (actualPayment.status !== object.status) {
        logger.warn(logEvents.paymentWebhookIgnoredStatusMismatch, {
          event,
          providerPaymentId: object.id,
          webhookStatus: object.status,
          actualStatus: actualPayment.status,
        });
        return res.sendStatus(200);
      }

      // достаем ids из метадаты
      const metadataPaymentId = Number(actualPayment.metadata?.paymentId);
      const metadataOrderId = Number(actualPayment.metadata?.orderId);

      // пробуем найти платеж по metadata payment id
      if (!innerPayment && Number.isInteger(metadataPaymentId)) {
        innerPayment = await prisma.payment.findUnique({
          where: { id: metadataPaymentId },
        });
      }

      // если не нашли, матчим по заказу и сумме
      if (!innerPayment && Number.isInteger(metadataOrderId)) {
        const orderWithCurrentPayment = await prisma.order.findUnique({
          where: { id: metadataOrderId },
          include: { currentPayment: true },
        });

        const currentPayment = orderWithCurrentPayment?.currentPayment;
        const providerAmount = Number(actualPayment.amount.value);

        if (
          currentPayment &&
          !currentPayment.providerPaymentId &&
          (currentPayment.status === "PROVIDER_UNKNOWN" ||
            currentPayment.status === "PENDING") &&
          currentPayment.amount === providerAmount
        ) {
          innerPayment = currentPayment;
        }
      }

      if (!innerPayment) {
        // выходим если локальный платеж не нашли
        logger.warn(logEvents.paymentWebhookPaymentNotFound, {
          event,
          providerPaymentId: object.id,
          metadataPaymentId,
          metadataOrderId,
        });
        return res.sendStatus(200);
      }

      // обновляем локальный статус платежа
      await prisma.payment.update({
        where: { id: innerPayment.id },
        data: {
          providerPaymentId: innerPayment.providerPaymentId ?? actualPayment.id,
          status: mapYooKassaStatus(actualPayment.status),
          paidAt: actualPayment.paid ? new Date() : null,
          canceledAt:
            actualPayment.status === "canceled"
              ? new Date()
              : innerPayment.canceledAt,
        },
      });

      logger.info(logEvents.paymentStatusUpdatedFromWebhook, {
        event,
        paymentId: innerPayment.id,
        orderId: innerPayment.orderId,
        providerPaymentId: innerPayment.providerPaymentId ?? actualPayment.id,
        providerStatus: actualPayment.status,
        localStatus: mapYooKassaStatus(actualPayment.status),
      });

      // проверяем что платеж еще текущий у заказа
      const order = await prisma.order.findUnique({
        where: { id: innerPayment.orderId },
        select: { currentPaymentId: true },
      });

      if (!order || order.currentPaymentId !== innerPayment.id) {
        return res.sendStatus(200);
      }

      // обновляем статус заказа по событию
      if (event === "payment.succeeded") {
        await markCurrentPaymentOrderPaid({
          orderId: innerPayment.orderId,
          paymentId: innerPayment.id,
          providerPaymentId: innerPayment.providerPaymentId ?? actualPayment.id,
          source: "webhook",
        });
      }

      if (event === "payment.canceled") {
        await prisma.order.update({
          where: { id: innerPayment.orderId },
          data: {
            status: "PENDING_PAYMENT",
          },
        });

        logger.info(logEvents.orderMarkedPendingPaymentFromWebhook, {
          paymentId: innerPayment.id,
          orderId: innerPayment.orderId,
          providerPaymentId: innerPayment.providerPaymentId ?? actualPayment.id,
        });
      }

      return res.sendStatus(200);
    } catch (e) {
      return next(e);
    }
  }

  async checkOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as CheckOrderStatusParams;
      const orderId = Number(params.orderId);
      const paymentId = Number(params.paymentId);

      if (!Number.isInteger(orderId) || !Number.isInteger(paymentId)) {
        throw ApiError.badRequest(
          "The checking order status requires orderId and paymentId"
        );
      }

      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          orderId,
        },
        select: {
          id: true,
          status: true,
          providerPaymentId: true,
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!payment) {
        throw ApiError.badRequest("There is no payment with such orderId/paymentId");
      }

      let actualPayment = payment;

      if (
        payment.providerPaymentId &&
        (payment.status === "PENDING" || payment.status === "PROVIDER_UNKNOWN")
      ) {
        const providerPayment = await withTimeout(
          YouKassa.getPayment(payment.providerPaymentId),
          YOOKASSA_REQUEST_TIMEOUT_MS,
          "YooKassa get payment timed out"
        );

        actualPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: buildPaymentUpdateFromProvider(providerPayment),
          select: {
            id: true,
            status: true,
            providerPaymentId: true,
            order: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        logger.info(logEvents.paymentStatusCheckRefreshedFromProvider, {
          orderId: actualPayment.order.id,
          paymentId: actualPayment.id,
          providerPaymentId: actualPayment.providerPaymentId,
          paymentStatus: actualPayment.status,
          orderStatus: actualPayment.order.status,
        });
      }

      if (actualPayment.status === "SUCCEEDED") {
        const orderStatus = await markCurrentPaymentOrderPaid({
          orderId: actualPayment.order.id,
          paymentId: actualPayment.id,
          providerPaymentId: actualPayment.providerPaymentId,
          source: "status_check",
        });

        actualPayment = {
          ...actualPayment,
          order: {
            ...actualPayment.order,
            status: orderStatus,
          },
        };
      }

      return res.json({
        orderId: actualPayment.order.id,
        paymentId: actualPayment.id,
        orderStatus: actualPayment.order.status,
        paymentStatus: actualPayment.status,
        isPaid:
          actualPayment.status === "SUCCEEDED" ||
          actualPayment.order.status === "PAID" ||
          actualPayment.order.status === "FULFILLMENT_PENDING",
      });
    } catch (e) {
      return next(e);
    }
  }
}

export const paymentController = new PaymentController();

type MarkPaidSource = "webhook" | "status_check";

async function markCurrentPaymentOrderPaid({
  orderId,
  paymentId,
  providerPaymentId,
  source,
}: {
  orderId: number;
  paymentId: number;
  providerPaymentId?: string | null;
  source: MarkPaidSource;
}) {
  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, currentPaymentId: true },
  });

  if (!currentOrder || currentOrder.currentPaymentId !== paymentId) {
    return currentOrder?.status ?? "PENDING_PAYMENT";
  }

  if (
    currentOrder.status === "FULFILLMENT_PENDING" ||
    currentOrder.status === "SHIPPED" ||
    currentOrder.status === "DELIVERED"
  ) {
    return currentOrder.status;
  }

  const order =
    currentOrder.status === "PAID"
      ? currentOrder
      : await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
          },
          select: { id: true, status: true },
        });

  logger.info(
    source === "webhook"
      ? logEvents.orderMarkedPaidFromWebhook
      : logEvents.orderMarkedPaidFromStatusCheck,
    {
      paymentId,
      orderId: order.id,
      providerPaymentId,
    }
  );

  try {
    await createCdekShipmentForPaidOrder(order.id);
  } catch (e) {
    logger.error(logEvents.cdekShipmentCreateFailedForPaidOrder, {
      paymentId,
      orderId: order.id,
      providerPaymentId,
      err: e,
    });
    console.error("Failed to create CDEK shipment for paid order", {
      orderId: order.id,
      error: e,
    });
  }

  return order.status;
}
