import { Router } from "express";
import { imageController } from "../controllers/imageController";
const imageRouter = Router();

imageRouter.get("/about-images", imageController.getAllFiles); // для получения всех картинок

imageRouter.post("/uploads", imageController.uploadFile); // Загрузить файл на сервер. Обычно возвращает url, fileId или path.

imageRouter.post("/objects/:id/images", imageController.bindFileTo); // Привязать картинку к объекту.

imageRouter.delete("/objects/:id/images/:imageId", imageController.deleteFile); // Удалить картинку у объекта.

imageRouter.patch("/objects/:id/images/:imageId", imageController.changeFile); // Например, поменять порядок, сделать главной и т.п.

// api/images/...

export default imageRouter;
