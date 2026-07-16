import { Router } from "express";
import { ordersController } from "../controllers/ordersController";
import checkRoleMiddleware from "../middleware/CheckRoleMiddleware";

const ordersRouter = Router();

ordersRouter.get("/", checkRoleMiddleware("ADMIN"), ordersController.getOrders);

// api/orders/...

export default ordersRouter;
