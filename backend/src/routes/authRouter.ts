import { Router } from "express";
import { authController } from "../controllers/authController";
const authRouter = Router();

authRouter.post("/registration", authController.registration); // авторизация -- Отправить логин и пароль.
authRouter.post("/login", authController.login); // авторизация -- Отправить логин и пароль.
authRouter.post("/logout", authController.logOut); // выйти из сессии
authRouter.get("/session", authController.checkAuth); // проверка авторизован или нет по jwt токену, есть ли активная сессия при старте приложения.

// api/auth...

export default authRouter;
