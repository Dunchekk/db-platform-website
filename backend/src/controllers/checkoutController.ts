import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { ReqOrderBody } from "../types/checkout.types";
import { suggestCdekDeliveryPrice } from "../services/cdek.service";
import {
  validateEmail,
  validatePhone,
  validateRequiredString,
} from "../helpers/validation";
import { Order } from "@prisma/client";
import { prepareOrderItems } from "../services/order.service";
import { YooCheckout } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import "dotenv/config";
import { CreatePayload } from "../services/yookassa.service";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";

const BASE_WEIGHT = 500; // в граммах

const YOUKASSA_SECRET_KEY = process.env.YOUKASSA_SECRET_KEY as string;
const SHOP_ID = process.env.SHOP_ID as string;

const YouKassa = new YooCheckout({
  shopId: SHOP_ID,
  secretKey: YOUKASSA_SECRET_KEY,
});

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
        // deliveryPrice,
        comment,
        // subtotal,
        // total,
        items,
      }: ReqOrderBody = req.body;

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
      const order = await prisma.$transaction(async (tx): Promise<Order> => {
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

      //---------------------------------------------------- создаем payment: panding

      let innerPayment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
        },
      });

      //---------------------------------------------------- создаем payment youkassa

      const idempotenceKey = "02347fc4-a1f0-49db-807e-f0d67c2ed5a5";

      const createPayload = await CreatePayload(
        order,
        order.id,
        innerPayment.id
      );

      try {
        const payment = await YouKassa.createPayment(
          createPayload,
          idempotenceKey
        );

        innerPayment = await prisma.payment.update({
          // обновляем наш внутренний payment
          where: { id: innerPayment.id },
          data: {
            providerPaymentId: payment.id,
            idempotenceKey,
            confirmationUrl: payment.confirmation.confirmation_url,
            status: mapYooKassaStatus(payment.status),
            paidAt: payment.paid ? new Date() : null,
          },
        });
      } catch (e) {
        await prisma.payment.update({
          where: { id: innerPayment.id },
          data: {
            status: "FAILED",
          },
        });

        throw e;
      }

      //----------------------------------------------------

      // позже: редиректнуть пользователя на страницу оплаты
      // позже: принять сообщение страницы оплаты об оплате
      // позже: обработать и записать данные о доставке

      // отправить подтверждение на имейл (?)

      //----------------------------------------------------

      const answer = {
        orderId: order.id,
        paymentId: innerPayment.id,
        confirmationUrl: innerPayment.confirmationUrl,
      };
      res.json(answer);
    } catch (e) {
      if (e instanceof ApiError) {
        return next(e);
      }
      if (e instanceof Error) {
        console.log(e);
        return next(e);
      }

      // сделать эрроры посильнее
    }
  }
}

export const checkoutController = new CheckoutController();
