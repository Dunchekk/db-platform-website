import { Router } from "express";
const authRouter = Router();

authRouter.post("/login", () => {}); // авторизация -- Отправить логин и пароль.
authRouter.post("/logout", () => {}); // выйти из сессии
authRouter.get("/session", () => {}); // проверка авторизован или нет по jwt токену, есть ли активная сессия при старте приложения.

// api/auth...

export default authRouter;
