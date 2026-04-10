import { Router } from "express";
import { itemController } from "../controllers/itemController";
const itemRouter = Router();

itemRouter.get("/", itemController.getAllItems); // для получения объектов

itemRouter.get("/:id", itemController.getOneItem); // для получения конкретного объекта

itemRouter.post("/", itemController.createItem); // для создания объекта

itemRouter.post("/:id", itemController.changeItem); // для изменения объекта

itemRouter.delete("/:id", itemController.deleteItem); // для удаления объекта

// api/items/...

export default itemRouter;
