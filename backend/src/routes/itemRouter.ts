import { Router } from "express";
const itemRouter = Router();

itemRouter.get("/", () => {}); // для получения объектов

itemRouter.get("/:id", () => {}); // для получения конкретного объекта

itemRouter.post("/", () => {}); // для создания объекта

itemRouter.post("/:id", () => {}); // для изменения объекта

itemRouter.delete("/:id", () => {}); // для удаления объекта

// api/items/...

export default itemRouter;
