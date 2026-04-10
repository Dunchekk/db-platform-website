import { Router } from "express";
const imageRouter = Router();

imageRouter.get("/about-images", () => {}); // для получения всех картинок

imageRouter.post("/uploads", () => {}); // Загрузить файл на сервер. Обычно возвращает url, fileId или path.

imageRouter.post("/objects/:id/images", () => {}); // Привязать картинку к объекту.

imageRouter.delete("/objects/:id/images/:imageId", () => {}); // Удалить картинку у объекта.

imageRouter.patch("/objects/:id/images/:imageId", () => {}); // Например, поменять порядок, сделать главной и т.п.

// api/images/...

export default imageRouter;
