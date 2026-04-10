import type { Request, Response } from "express";
import { prisma } from "../db";

class ItemController {
  async getAllItems(req: Request, res: Response) {}

  async getOneItem(req: Request, res: Response) {}

  async createItem(req: Request, res: Response) {
    // POST api/items/
    const { name, price } = req.body;
    const item = await prisma.item.create({
      data: {
        name,
        price,
      },
    });
    return res.json(item);
  }

  async changeItem(req: Request, res: Response) {}

  async deleteItem(req: Request, res: Response) {}
}

export const itemController = new ItemController();
