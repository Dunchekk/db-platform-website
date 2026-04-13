import { Router } from "express";
import { imageController } from "../controllers/imageController";
import { uploadMiddleware } from "../middleware/UploadMiddleware";
import checkRoleMiddleware from "../middleware/CheckRoleMiddleware";
const imageRouter = Router();

imageRouter.get("/", imageController.getAllFiles); // для получения всех картинок

imageRouter.get("/:id", imageController.getItemFiles); // для получения картинок конкретного объекта

imageRouter.post(
  "/:id",
  checkRoleMiddleware("ADMIN"),
  uploadMiddleware,
  imageController.uploadFile
); // Загрузить файл на сервер + привязать к айди объекта. возвращаем объект картинки

imageRouter.delete(
  "/:id/:imageId",
  checkRoleMiddleware("ADMIN"),
  imageController.deleteFile
); // Удалить картинку у объекта.

imageRouter.patch(
  "/:id/:imageId",
  checkRoleMiddleware("ADMIN"),
  imageController.changeFile
); // Например, поменять порядок, сделать главной и т.п.

// api/images/...

export default imageRouter;
