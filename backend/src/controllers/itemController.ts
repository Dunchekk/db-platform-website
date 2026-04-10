import type { Request, Response } from "express";
import { prisma } from "../db";
import { CreateItemBody, ItemImage, ItemInformation } from "../types/itemTypes";
import { ItemInfo } from "@prisma/client";
import { title } from "node:process";

class ItemController {
  async getAllItems(req: Request, res: Response) {
    // GET api/items/
    const items = await prisma.item.findMany();
    return res.json(items);
  }

  async getOneItem(req: Request, res: Response) {}

  async createItem(req: Request, res: Response) {
    // POST api/items/
    const { name, price, order, points, info, images }: CreateItemBody =
      req.body;

    // добавляем айтем
    const item = await prisma.item.create({
      data: {
        name,
        price,
        order,
      },
    });
    const iId = item.id;

    // к нему добавляем поинты - массив строк
    points.forEach(async (p: string) => {
      await prisma.itemPoint.create({
        data: {
          point: p,
          itemId: iId,
        },
      });
    });

    // к нему добавляем инфо - массив объектов с заголовком и описанием
    info.forEach(async (inf: ItemInformation) => {
      await prisma.itemInfo.create({
        data: {
          itemId: iId,
          title: inf.title,
          description: inf.description,
        },
      });
    });

    // к нему добавляем картинки -- массив объектов с юрл + айди + позицией
    // ДО НЕГО СДЕЛАТЬ АПЛОУД!
    images.forEach(async (im: ItemImage) => {
      await prisma.itemImage.create({
        data: {
          itemId: iId,
          position: im.position,
          url: im.url,
        },
      });
    });

    return res.json(item);
  }

  async changeItem(req: Request, res: Response) {}

  async deleteItem(req: Request, res: Response) {}
}

export const itemController = new ItemController();
