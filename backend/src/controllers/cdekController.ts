import ApiError from "../error/ApiError";
import type { NextFunction, Request, Response } from "express";
import {
  suggestCdekCities,
  suggestCdekOffices,
} from "../services/cdek.service";

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
    // GET /api/cdek/delivery-points?city_code=44
    try {
      const city_code =
        typeof req.query.city_code === "string" &&
        !isNaN(Number(req.query.city_code))
          ? Number(req.query.city_code)
          : null;

      if (!city_code) {
        throw ApiError.badRequest("City query must contain city cdek code");
      }

      const offices = await suggestCdekOffices(city_code);

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
}

export const cdekController = new CdekController();
