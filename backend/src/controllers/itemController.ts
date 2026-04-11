import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import { CreateItemBody, ItemInformation } from "../types/itemTypes";
import ApiError from "../error/ApiError";

class ItemController {
  async getAllItems(req: Request, res: Response, next: NextFunction) {
    // GET api/items/
    try {
      const items = await prisma.item.findMany({
        include: {
          images: true,
        },
      });

      return res.json(items);
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async getOneItem(req: Request, res: Response, next: NextFunction) {
    // GET api/items/:id
    try {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      // POST api/items/
      const { name, price, order, points, info }: CreateItemBody = req.body;

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
          points.map((p: { point: string }) =>
            tx.itemPoint.create({
              data: {
                itemId,
                point: p.point,
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

  async changeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, price, order, points, info } = req.body;

      const itemId = Number(id);

      const item = await prisma.$transaction(async (tx) => {
        const updatedItem = await tx.item.update({
          where: { id: itemId },
          data: {
            name,
            price,
            order,
          },
        });

        await tx.itemPoint.deleteMany({
          where: { itemId },
        });

        await tx.itemInfo.deleteMany({
          where: { itemId },
        });

        await Promise.all(
          points.map((p: { point: string }) =>
            tx.itemPoint.create({
              data: {
                itemId,
                point: p.point,
              },
            })
          )
        );

        await Promise.all(
          info.map((inf: { title: string; description: string }) =>
            tx.itemInfo.create({
              data: {
                itemId,
                title: inf.title,
                description: inf.description,
              },
            })
          )
        );

        return updatedItem;
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

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    // DELETE api/items/:id
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        next(ApiError.badRequest("Invalid item id"));
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.itemPoint.deleteMany({ where: { itemId: id } });
        await tx.itemInfo.deleteMany({ where: { itemId: id } });
        await tx.itemImage.deleteMany({ where: { itemId: id } });
        await tx.item.delete({ where: { id } });
      });

      return res.json({ message: "Item deleted" });
    } catch (err) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }
}

export const itemController = new ItemController();
