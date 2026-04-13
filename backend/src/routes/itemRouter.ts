import { Router } from "express";
import { itemController } from "../controllers/itemController";
import checkRoleMiddleware from "../middleware/CheckRoleMiddleware";
const itemRouter = Router();

itemRouter.get("/", itemController.getAllItems); // для получения объектов

itemRouter.get("/:id", itemController.getOneItem); // для получения конкретного объекта

itemRouter.post("/", checkRoleMiddleware("ADMIN"), itemController.createItem); // для создания объекта

itemRouter.put("/:id", checkRoleMiddleware("ADMIN"), itemController.changeItem); // для изменения объекта

itemRouter.delete(
  "/:id",
  checkRoleMiddleware("ADMIN"),
  itemController.deleteItem
); // для удаления объекта

// api/items/...

export default itemRouter;
