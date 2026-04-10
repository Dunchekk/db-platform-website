import { Router } from "express";
import { checkoutController } from "../controllers/checkoutController";
const checkoutRouter = Router();

checkoutRouter.post("/", checkoutController.createOrder); // Отправка формы из корзины/чекаута.

// api/checkout/...

export default checkoutRouter;
