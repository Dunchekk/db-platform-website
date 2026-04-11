import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import { CreateItemBody, ItemImage, ItemInformation } from "../types/itemTypes";
import { ItemInfo } from "@prisma/client";
import { title } from "node:process";
import ApiError from "../error/ApiError";

class ItemController {
  async getAllItems(req: Request, res: Response) {
    // GET api/items/
    const items = await prisma.item.findMany({
      include: {
        images: true,
      },
    });

    return res.json(items);
  }

  async getOneItem(req: Request, res: Response) {
    // GET api/items/:id
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        points: true,
        info: true,
      },
    });
    return res.json(item);
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      // POST api/items/
      const { name, price, order, points, info, images }: CreateItemBody =
        req.body;

      const item = await prisma.$transaction(async (tx) => {
        const createdItem = await tx.item.create({
          data: {
            name,
            price,
            order,
          },
        });

        const itemId = createdItem.id;

        await Promise.all(
          points.map((p: string) =>
            tx.itemPoint.create({
              data: {
                point: p,
                itemId,
              },
            })
          )
        );

        await Promise.all(
          info.map((inf: ItemInformation) =>
            tx.itemInfo.create({
              data: {
                itemId,
                title: inf.title,
                description: inf.description,
              },
            })
          )
        );

        await Promise.all(
          images.map((im: ItemImage) =>
            tx.itemImage.create({
              data: {
                itemId,
                position: Number(im.position),
                url: im.url,
              },
            })
          )
        );

        return createdItem;
      });

      return res.json(item);
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async changeItem(req: Request, res: Response) {}

  async deleteItem(req: Request, res: Response) {}
}

export const itemController = new ItemController();
