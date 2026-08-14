import type { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import { ReqOrderBody } from "../types/checkout.types";
import { suggestCdekDeliveryPrice } from "../services/cdek.api";
import {
  getOrCreateCheckoutOrder,
  prepareOrderItems,
} from "../services/order.service";
import { resolveCheckoutPayment } from "../services/yookassa.service";
import { logEvents, logger } from "../lib/logger";
import { buildCdekPackagesFromOrderItems } from "../services/helpers/buildCdekPackagesFromOrderItems";
import {
  CURRENT_OFFER_VERSION,
  CURRENT_PERSONAL_DATA_CONSENT_VERSION,
} from "../config/legalDocuments";

class CheckoutController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    const requestBody = req.body as Partial<ReqOrderBody>;

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
        offerAccepted,
        offerVersion,
        personalDataConsentAccepted,
        personalDataConsentVersion,
      }: ReqOrderBody = req.body;

      if (!checkoutAttemptKey) {
        throw ApiError.badRequest("checkoutAttemptKey is required");
      }

      if (offerAccepted !== true) {
        throw ApiError.badRequest("Offer acceptance is required");
      }

      if (personalDataConsentAccepted !== true) {
        throw ApiError.badRequest(
          "Personal data processing agreement is required"
        );
      }

      if (offerVersion !== CURRENT_OFFER_VERSION) {
        throw ApiError.badRequest("Offer version is invalid");
      }

      if (
        personalDataConsentVersion !== CURRENT_PERSONAL_DATA_CONSENT_VERSION
      ) {
        throw ApiError.badRequest(
          "Personal data processing agreement version is invalid"
        );
      }

      if (!Array.isArray(items) || items.length <= 0) {
        throw ApiError.badRequest("Must be 1 item or more");
      }

      logger.info(logEvents.checkoutCreateStarted, {
        checkoutAttemptKey,
        itemsCount: items.length,
        cityCode: city?.code,
      });

      const { subtotal, orderItemsData } = await prepareOrderItems(items);
      const cdekPackages = buildCdekPackagesFromOrderItems(orderItemsData);

      const updateDeliveryPrice = await suggestCdekDeliveryPrice(
        city.code,
        cdekPackages
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
        offerVersion,
        personalDataConsentVersion,
      });

      const payment = await resolveCheckoutPayment(order);

      logger.info(logEvents.checkoutCreateSucceeded, {
        checkoutAttemptKey,
        orderId: order.id,
        paymentId: payment.id,
        paymentStatus: payment.status,
      });

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
        logger.error(logEvents.checkoutCreateFailed, {
          checkoutAttemptKey: requestBody.checkoutAttemptKey,
          itemsCount: Array.isArray(requestBody.items)
            ? requestBody.items.length
            : undefined,
          cityCode: requestBody.city?.code,
          err: e,
        });
        return next(e);
      }
    }
  }
}
export const checkoutController = new CheckoutController();
