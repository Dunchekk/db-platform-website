import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { parseIdParam } from "../helpers/parseIdParam";

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

      const image = await prisma.itemImage.create({
        data: {
          itemId: iId,
          url,
          position: 0,
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
      const imageId = parseIdParam(req.params.imageId);

      // проверка на сущестовование
      const image = await prisma.itemImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw ApiError.notFound("Image not found by this id");
      }

      await prisma.itemImage.delete({ where: { id: imageId } });

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

  async changeFile(req: Request, res: Response, next: NextFunction) {
    // PATCH api/images/:id/:imageId

    // с фронта:
    // {
    //     "id": 4,
    //     "url": "/static/uploads/3_19875276_1645700735499975_4334392123731064015_n.png",
    //     "itemId": 3,
    //     "position": 0
    // }
    try {
      const imageId = parseIdParam(req.params.imageId);
      const itemId = parseIdParam(req.params.id);
      const updateImage = req.body;

      // проверка на сущестовование
      const image = await prisma.itemImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw ApiError.notFound("Image not found by this id");
      }

      // проверка на соответсвие
      if (
        !updateImage ||
        Number(updateImage.id) !== imageId ||
        Number(updateImage.itemId) !== itemId
      ) {
        next(ApiError.badRequest("Request do not have required body"));
        return;
      }

      const newImage = await prisma.itemImage.update({
        data: {
          position: updateImage.position,
        },
        where: {
          id: imageId,
        },
      });

      return res.json(newImage);
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
