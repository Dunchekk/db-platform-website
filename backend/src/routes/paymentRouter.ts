import { Router } from "express";
import { paymentController } from "../controllers/paymentController";
import {
  paymentStatusRateLimiter,
  webhookRateLimiter,
} from "../middleware/Security.middleware";
const paymentRouter = Router();

paymentRouter.get(
  "/order/:orderId/payment/:paymentId/status",
  paymentStatusRateLimiter,
  paymentController.checkOrderStatus
);

paymentRouter.post(
  "/webhook/youkassa",
  webhookRateLimiter,
  paymentController.handleYouKassaWebhook
); // для получения объектов

// api/payment/...

export default paymentRouter;
