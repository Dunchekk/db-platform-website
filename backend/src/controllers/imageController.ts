import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import fs from "fs/promises";
import ApiError from "../error/ApiError";
import { parseIdParam } from "../helpers/parseIdParam";
import { getAbsoluteImagePath } from "../helpers/getStaticPaths";

class ImageController {
  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    // api/images/... потом сделать для получения всех картинок конкретного объекта

    try {
      const images = await prisma.itemImage.findMany();
      res.json(images);
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async getItemFiles(req: Request, res: Response, next: NextFunction) {
    // GET /api/images/:id

    try {
      const id = parseIdParam(req.params.id);

      const images = await prisma.itemImage.findMany({
        where: {
          itemId: id,
        },
        orderBy: { position: "asc" }, // ascending = по возрастанию
      });

      res.json(images);
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  // POST /api/images/...
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return res.status(400).json({ message: "File was not uploaded" }); // есть req.file -> multer файл поймал
    }

    try {
      const url = `/uploads/${req.file.filename}`;
      const iId = parseIdParam(req.params.id);

      const lastImage = await prisma.itemImage.findFirst({
        where: { itemId: iId },
        orderBy: { position: "desc" },
      });

      const nextPosition = lastImage ? lastImage.position + 1 : 1;

      const image = await prisma.itemImage.create({
        data: {
          itemId: iId,
          url,
          position: nextPosition,
        },
      });

      res.status(201).json(image);
    } catch (err: unknown) {
      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    // DELETE api/images/:id/:imageId
    try {
      const itemId = parseIdParam(req.params.id);
      const imageId = parseIdParam(req.params.imageId);

      // проверка на сущестовование
      const image = await prisma.itemImage.findUnique({
        where: { id: imageId },
      });

      if (!image || image.itemId !== itemId) {
        throw ApiError.notFound("Image not found by this id");
      }

      await prisma.itemImage.delete({ where: { id: imageId } });

      const filePath = getAbsoluteImagePath(image.url);

      try {
        await fs.unlink(filePath);
      } catch (e: unknown) {
        if (!(e instanceof Error) || !("code" in e) || e.code !== "ENOENT") {
          console.error("Failed to delete image file:", e);
        }
      }

      res.status(200).json({ message: "Image deleted" });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        next(err);
        return;
      }

      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }

  async swapFiles(req: Request, res: Response, next: NextFunction) {
    // PATCH api/images/:id/

    const id = parseIdParam(req.params.id);

    try {
      const firstUpdateImage = req.body[0];
      const secondUpdateImage = req.body[1];

      // проверка на соответсвие
      if (
        !Array.isArray(req.body) ||
        req.body.length !== 2 ||
        !firstUpdateImage ||
        !secondUpdateImage ||
        firstUpdateImage.id === secondUpdateImage.id ||
        !firstUpdateImage.id ||
        !secondUpdateImage.id ||
        !firstUpdateImage.itemId ||
        !secondUpdateImage.itemId ||
        typeof firstUpdateImage.position !== "number" ||
        typeof secondUpdateImage.position !== "number" ||
        firstUpdateImage.itemId !== Number(id) ||
        secondUpdateImage.itemId !== Number(id)
      ) {
        next(ApiError.badRequest("Request do not have required body"));
        return;
      }

      // проверка на сущестовование
      const image1 = await prisma.itemImage.findUnique({
        where: { id: firstUpdateImage.id },
      });

      const image2 = await prisma.itemImage.findUnique({
        where: { id: secondUpdateImage.id },
      });

      if (!image1 || !image2) {
        throw ApiError.notFound("Image not found by this id");
      }

      // проверка на соответсвие
      if (image1.itemId !== image2.itemId || image1.itemId !== Number(id)) {
        next(ApiError.badRequest("Request do not have required body"));
        return;
      }

      const image1Pos = image1.position;
      const image2Pos = image2.position;

      const newImages = await prisma.$transaction(async (tx) => {
        const newImage1 = await tx.itemImage.update({
          where: { id: firstUpdateImage.id },
          data: {
            position: image2Pos,
          },
        });

        const newImage2 = await tx.itemImage.update({
          where: { id: secondUpdateImage.id },
          data: {
            position: image1Pos,
          },
        });

        return [newImage1, newImage2];
      });

      return res.json(newImages);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        next(err);
        return;
      }

      if (err instanceof Error) {
        next(ApiError.badRequest(err.message));
        return;
      }

      next(ApiError.badRequest("Unknown error"));
    }
  }
}
export const imageController = new ImageController();

// Это уже финальный route handler, то есть контроллер.
// Он не ловит файл “с нуля”, а работает с уже обработанным request.

// Его задача:

// собрать URL
// добавить картинку в базу
// вернуть ответ клиенту через res.json(...)
