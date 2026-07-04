import { Router } from "express";
import { paymentController } from "../controllers/paymentController";
const paymentRouter = Router();

paymentRouter.get(
  "/order/:orderId/payment/:paymentId/status",
  paymentController.checkOrderStatus
);

paymentRouter.post(
  "/webhook/youkassa",
  paymentController.handleYouKassaWebhook
); // для получения объектов

// api/payment/...

export default paymentRouter;
