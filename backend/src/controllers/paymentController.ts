import type { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";
import { prisma } from "../db";
import { YouKassa } from "../services/yookassa.service";
import { createCdekShipmentForPaidOrder } from "../services/cdek.service";

class PaymentController {
  async handleYouKassaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { event, object } = req.body;

      // отсекаем пустой или битый вебхук
      if (!event || !object?.id) {
        return res.sendStatus(200);
      }

      // ищем платеж по id провайдера
      let innerPayment = await prisma.payment.findFirst({
        where: {
          providerPaymentId: object.id,
        },
      });

      // запрашиваем актуальный статус у провайдера
      const actualPayment = await YouKassa.getPayment(object.id);

      if (actualPayment.status !== object.status) {
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
        const order = await prisma.order.update({
          where: { id: innerPayment.orderId },
          data: {
            status: "PAID",
          },
        });

        try {
          await createCdekShipmentForPaidOrder(order.id);
        } catch (e) {
          console.error("Failed to create CDEK shipment for paid order", {
            orderId: order.id,
            error: e,
          });
        }
      }

      if (event === "payment.canceled") {
        await prisma.order.update({
          where: { id: innerPayment.orderId },
          data: {
            status: "PENDING_PAYMENT",
          },
        });
      }

      return res.sendStatus(200);
    } catch (e) {
      return next(e);
    }
  }
}

export const paymentController = new PaymentController();
