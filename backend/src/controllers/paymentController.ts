import type { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";
import { prisma } from "../db";
import { YouKassa } from "../services/yookassa.service";

class PaymentController {
  async handleYouKassaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { event, object } = req.body;

      // Добавить проверку айпи + проверить актуальность запроса позже

      if (!event || !object?.id) {
        return res.sendStatus(200);
      }

      const innerPayment = await prisma.payment.findFirst({
        where: {
          providerPaymentId: object.id,
        },
      });

      if (!innerPayment || !innerPayment.providerPaymentId) {
        return res.sendStatus(200);
      }

      const actualPayment = await YouKassa.getPayment(object.id);

      if (actualPayment.status !== object.status) {
        return res.sendStatus(200);
      }

      await prisma.payment.update({
        where: { id: innerPayment.id },
        data: {
          status: mapYooKassaStatus(object.status),
          paidAt: object.paid ? new Date() : null,
          canceledAt:
            object.status === "canceled" ? new Date() : innerPayment.canceledAt,
        },
      });

      if (event === "payment.succeeded") {
        await prisma.order.update({
          where: { id: innerPayment.orderId },
          data: {
            status: "PAID",
          },
        });
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
