import type { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import { ReqOrderBody } from "../types/checkout.types";
import { suggestCdekDeliveryPrice } from "../services/cdek.api";
import {
  getOrCreateCheckoutOrder,
  prepareOrderItems,
} from "../services/order.service";
import "dotenv/config";
import { resolveCheckoutPayment } from "../services/yookassa.service";

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

      const order = await getOrCreateCheckoutOrder({
        checkoutAttemptKey,
        subtotal,
        orderItemsData,
        deliveryPrice: updateDeliveryPrice.total_sum,
        firstName,
        lastName,
        patronymic,
        email,
        phone,
        telegram,
        office,
        city,
        comment,
      });

      const payment = await resolveCheckoutPayment(order);

      return res.json({
        orderId: order.id,
        paymentId: payment.id,
        confirmationUrl: payment.confirmationUrl,
        alreadyPaid: payment.status === "SUCCEEDED",
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
}
export const checkoutController = new CheckoutController();
