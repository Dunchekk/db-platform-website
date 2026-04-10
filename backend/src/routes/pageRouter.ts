import { Router } from "express";
import { pageController } from "../controllers/pageController";
const pageRouter = Router();

pageRouter.get("/", pageController.getApp); // для получения приложения
pageRouter.get("/about", () => {}); // для получения приложения
pageRouter.get("/object/:id", () => {}); // для получения приложения
pageRouter.get("/checkout", () => {}); // для получения приложения
pageRouter.get("/admin", () => {}); // для получения приложения
pageRouter.get("/", () => {}); // для получения приложения
pageRouter.get("/", () => {}); // для получения приложения

export default pageRouter;
