import { Router } from "express";
import authRouter from "./authRouter";
import checkoutRouter from "./checkoutRouter";
import imageRouter from "./imageRouter";
import itemRouter from "./itemRouter";
import cdekRouter from "./cdekRouter";
import paymentRouter from "./paymentRouter";
const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/checkout", checkoutRouter);
apiRouter.use("/images", imageRouter);
apiRouter.use("/items", itemRouter);
apiRouter.use("/cdek", cdekRouter);
apiRouter.use("/payment", paymentRouter);

export default apiRouter;
