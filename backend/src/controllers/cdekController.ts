import ApiError from "../error/ApiError";
import type { NextFunction, Request, Response } from "express";
import { suggestCdekCities } from "../services/cdek.service";

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
      if (e instanceof Error) {
        next(ApiError.badRequest(e.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }
}

export const cdekController = new CdekController();
