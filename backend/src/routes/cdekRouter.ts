import { Router } from "express";
import { cdekController } from "../controllers/cdekController";

const cdekRouter = Router();

cdekRouter.get("/cities", cdekController.getCitiesByParams); // для получения всех городов по запросу
cdekRouter.get("/delivery-points", cdekController.getOfficesByParams); // для получения всех городов по запросу

export default cdekRouter;
