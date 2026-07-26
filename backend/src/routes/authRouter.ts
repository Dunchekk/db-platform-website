import { Router } from "express";
import { authController } from "../controllers/authController";
import authMiddleware from "../middleware/AuthMiddleware";
import { loginRateLimiter } from "../middleware/Security.middleware";
const authRouter = Router();

authRouter.post("/login", loginRateLimiter, authController.login); // авторизация -- Отправить логин и пароль.
authRouter.get("/session", authMiddleware, authController.checkAuth); // проверка авторизован или нет по jwt токену, есть ли активная сессия при старте приложения.

// api/auth...

export default authRouter;
