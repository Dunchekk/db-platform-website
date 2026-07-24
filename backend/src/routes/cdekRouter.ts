import { Router } from "express";
import { cdekController } from "../controllers/cdekController";
import { cdekRateLimiter } from "../middleware/Security.middleware";

const cdekRouter = Router();

cdekRouter.get("/cities", cdekRateLimiter, cdekController.getCitiesByParams); // для получения всех городов по запросу
cdekRouter.get(
  "/delivery-points",
  cdekRateLimiter,
  cdekController.getOfficesByParams
); // для получения всех городов по запросу
cdekRouter.post(
  "/delivery-price",
  cdekRateLimiter,
  cdekController.getDeliveryPriceByCity
); // для получения цены по городу и товарам заказа

export default cdekRouter;
