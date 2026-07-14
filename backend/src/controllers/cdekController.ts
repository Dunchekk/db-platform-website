import ApiError from "../error/ApiError";
import type { NextFunction, Request, Response } from "express";
import {
  DeliveryPricePreviewBody,
} from "../types/checkout.types";
import {
  suggestCdekCities,
  suggestCdekDeliveryPrice,
  suggestCdekOffices,
} from "../services/cdek.api";
import { validatePositiveInteger } from "../helpers/validation";
import { buildCdekPackagesFromOrderItems } from "../services/helpers/buildCdekPackagesFromOrderItems";
import { prepareOrderItems } from "../services/order.service";

class CdekController {
  async getCitiesByParams(req: Request, res: Response, next: NextFunction) {
    // GET /api/сdek/cities?query=мос
    try {
      const query =
        typeof req.query.query === "string" ? req.query.query.trim() : "";

      const cities = await suggestCdekCities(query);

      const normalized = cities.map((city) => ({
        uuid: city.city_uuid,
        code: city.code,
        label: city.full_name,
        countryCode: city.country_code,
      }));

      // отправляем его на фронт

      return res.json(normalized);
    } catch (e) {
      if (e instanceof ApiError) {
        next(e);
        return;
      }

      if (e instanceof Error) {
        next(ApiError.internal(e.message));
        return;
      }

      next(ApiError.internal("Unknown error"));
    }
  }

  async getOfficesByParams(req: Request, res: Response, next: NextFunction) {
    // GET https://api.cdek.ru/v2/deliverypoints
    // GET /api/cdek/delivery-points?city_code=44&weight=1200&length=40&width=30&height=8
    try {
      const city_code = validatePositiveInteger(
        req.query.city_code,
        "city_code"
      );
      const packageParams = {
        weight: validatePositiveInteger(req.query.weight, "weight"),
        length: validatePositiveInteger(req.query.length, "length"),
        width: validatePositiveInteger(req.query.width, "width"),
        height: validatePositiveInteger(req.query.height, "height"),
      };

      const offices = await suggestCdekOffices(city_code, packageParams);

      const normalized = offices.map((office) => ({
        code: office.code, // Код ПВЗ
        uuid: office.uuid, // Идентификатор офиса в ИС СДЭК
        address_comment: office.address_comment, // Описание местоположения
        nearest_metro_station: office.nearest_metro_station,
        work_time: office.work_time,
        phones: office.phones,
        type: office.type, // PVZ — склад СДЭК, POSTAMAT — постамат СДЭК
        site: office.site, // Ссылка на данный офис на сайте СДЭК
        work_time_list: office.work_time_list,
        work_time_exception_list: office.work_time_exception_list,
        location: office.location,
      }));

      // отправляем его на фронт

      return res.json(normalized);
    } catch (e) {
      if (e instanceof ApiError) {
        next(e);
        return;
      }

      if (e instanceof Error) {
        next(ApiError.internal(e.message));
        return;
      }

      next(ApiError.internal("Unknown error"));
    }
  }

  async getDeliveryPriceByCity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // POST /api/cdek/delivery-price { city_code: 44, items: [{ itemId: 1, quantity: 2 }] }
    try {
      const { city_code, items } = req.body as Partial<DeliveryPricePreviewBody>;

      const normalizedCityCode = validatePositiveInteger(city_code, "city_code");

      if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest("Price query must contain items");
      }

      const normalizedItems = items.map((item, index) => ({
        itemId: validatePositiveInteger(item?.itemId, `items[${index}].itemId`),
        quantity: validatePositiveInteger(
          item?.quantity,
          `items[${index}].quantity`
        ),
      }));

      const { orderItemsData } = await prepareOrderItems(normalizedItems);
      const cdekPackages = buildCdekPackagesFromOrderItems(orderItemsData);
      const deliveryInfo = await suggestCdekDeliveryPrice(
        normalizedCityCode,
        cdekPackages
      );

      const normalizedDeliveryInfo = {
        delivery_sum: deliveryInfo.delivery_sum,
        period_min: deliveryInfo.calendar_min ?? deliveryInfo.period_min,
        period_max: deliveryInfo.calendar_max ?? deliveryInfo.period_max,
        currency: deliveryInfo.currency === "RUB" ? "₽" : deliveryInfo.currency,
      };

      // отправляем его на фронт

      return res.json(normalizedDeliveryInfo);
    } catch (e) {
      if (e instanceof ApiError) {
        next(e);
        return;
      }

      if (e instanceof Error) {
        next(ApiError.internal(e.message));
        return;
      }

      next(ApiError.internal("Unknown error"));
    }
  }
}

export const cdekController = new CdekController();
