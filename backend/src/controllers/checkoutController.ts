import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { OrderWithCurrentPayment, ReqOrderBody } from "../types/checkout.types";
import { suggestCdekDeliveryPrice } from "../services/cdek.service";
import {
  validateEmail,
  validatePhone,
  validateRequiredString,
} from "../helpers/validation";
import { Order, Payment } from "@prisma/client";
import { prepareOrderItems } from "../services/order.service";
import "dotenv/config";
import { CreatePayload } from "../services/yookassa.service";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";
import { YouKassa } from "../services/yookassa.service";
import { randomUUID } from "crypto";
import { shouldMarkProviderUnknown } from "../helpers/shouldMarkProviderUnknown";

const BASE_WEIGHT = 500; // в граммах

class CheckoutController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        lastName,
        patronymic,
        email,
        phone,
        telegram,
        office,
        city,
        checkoutAttemptKey,
        // deliveryPrice,
        comment,
        // subtotal,
        // total,
        items,
      }: ReqOrderBody = req.body;

      if (!checkoutAttemptKey) {
        throw ApiError.badRequest("checkoutAttemptKey is required");
      }

      if (!Array.isArray(items) || items.length <= 0) {
        throw ApiError.badRequest("Must be 1 item or more");
      }

      const { subtotal, orderItemsData, totalQuantity } =
        await prepareOrderItems(items);

      const updateDeliveryPrice = await suggestCdekDeliveryPrice(
        city.code,
        totalQuantity * BASE_WEIGHT
      );

      // создаем заказ

      const existingOrder = await prisma.order.findUnique({
        where: { checkoutAttemptKey },
        include: { currentPayment: true },
      });

      let order;

      // создаем заказ

      if (existingOrder) {
        order = existingOrder;
      } else {
        order = await prisma.$transaction(async (tx): Promise<Order> => {
          const createdOrder = await tx.order.create({
            data: {
              firstName: validateRequiredString(firstName, "firstName"),
              lastName: validateRequiredString(lastName, "lastName"),
              patronymic,
              email: validateEmail(email),
              phone: validatePhone(phone),
              telegram,
              deliveryPrice: updateDeliveryPrice.total_sum,
              comment,
              subtotal: subtotal, // верный сабтотал
              checkoutAttemptKey: checkoutAttemptKey,
              total: subtotal + updateDeliveryPrice.total_sum,

              deliveryOfficeUuid: office.uuid,
              deliveryCityCode: city.code,
              deliveryCityLabel: city.label,
              deliveryMethod:
                office.type === "PVZ" ? "CDEK_PVZ" : "CDEK_POSTAMAT",
              deliveryOfficeAddress: office.location.address_full,
              deliveryOfficeCode: office.code,
              deliveryOfficeType: office.type,
            },
          });

          // создаем orderItems
          await Promise.all(
            orderItemsData.map((item) =>
              tx.orderItem.create({
                data: {
                  ...item,
                  orderId: createdOrder.id,
                },
              })
            )
          );

          return createdOrder;
        });
      }

      order = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          currentPayment: true,
        },
      });

      if (!order) {
        throw new Error("Order was created but cannot be loaded");
      }

      //---------------------------------------------------- создаем payment: panding

      const existingPayment = order.currentPayment;

      if (
        existingPayment &&
        existingPayment.status === "PENDING" &&
        existingPayment.confirmationUrl
      ) {
        return res.json({
          // если пеймент уже есть то возвращаем существующий, тот же самый
          orderId: order.id,
          paymentId: existingPayment.id,
          confirmationUrl: existingPayment.confirmationUrl,
        });
      }

      if (existingPayment && existingPayment.status === "SUCCEEDED") {
        return res.json({
          orderId: order.id,
          paymentId: existingPayment.id,
          confirmationUrl: existingPayment.confirmationUrl,
        });
      }

      if (existingPayment && existingPayment.status === "PROVIDER_UNKNOWN") {
        const restoredPayment = await this.tryRestoreUnknownPayment(
          order,
          existingPayment
        );

        if (
          restoredPayment.status === "PENDING" &&
          restoredPayment.confirmationUrl
        ) {
          return res.json({
            orderId: order.id,
            paymentId: restoredPayment.id,
            confirmationUrl: restoredPayment.confirmationUrl,
          });
        }

        if (restoredPayment.status === "SUCCEEDED") {
          return res.json({
            orderId: order.id,
            paymentId: restoredPayment.id,
            confirmationUrl: restoredPayment.confirmationUrl,
          });
        }
      }

      const newPayment = await this.createNewPaymentForOrder(order);

      return res.json({
        orderId: order.id,
        paymentId: newPayment.id,
        confirmationUrl: newPayment.confirmationUrl,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        return next(e);
      }

      if (e instanceof Error) {
        console.log(e);
        return next(e);
      }
    }
  }

  //----------------------------------------------------

  // позже: обработать и записать данные о доставке

  // отправить подтверждение на имейл (?)

  //----------------------------------------------------
  private async createNewPaymentForOrder(order: OrderWithCurrentPayment) {
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
        data: {
          providerPaymentId: providerPayment.id,
          confirmationUrl: providerPayment.confirmation.confirmation_url,
          status: mapYooKassaStatus(providerPayment.status),
          paidAt: providerPayment.paid ? new Date() : null,
        },
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

  private async tryRestoreUnknownPayment(
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
        data: {
          providerPaymentId: providerPayment.id,
          confirmationUrl: providerPayment.confirmation.confirmation_url,
          status: mapYooKassaStatus(providerPayment.status),
          paidAt: providerPayment.paid ? new Date() : null,
        },
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
}
export const checkoutController = new CheckoutController();
