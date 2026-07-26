import { Router } from "express";
import { checkoutController } from "../controllers/checkoutController";
import { checkoutRateLimiter } from "../middleware/Security.middleware";
const checkoutRouter = Router();

checkoutRouter.post("/", checkoutRateLimiter, checkoutController.createOrder); // Отправка формы из корзины/чекаута.

// api/checkout/...

export default checkoutRouter;
