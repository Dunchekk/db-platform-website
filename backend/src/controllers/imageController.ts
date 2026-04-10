import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";

class ImageController {
  async getAllFiles(req: Request, res: Response, next: NextFunction) {}

  // api/images/uploads...
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return res.status(400).json({ message: "File was not uploaded" }); // есть req.file -> multer файл поймал
    }

    try {
      const url = `/static/uploads/${req.file.filename}`;

      if (!Number(req.params.id)) {
        throw ApiError.badRequest("Params do not have any id!");
      }
      const iId = Number(req.params.id);

      const image = await prisma.itemImage.create({
        data: {
          itemId: iId,
          url,
          position: 0,
        },
      });

      res.status(201).json(image);
    } catch (err) {
      if (err instanceof ApiError) {
        next(err);
        return;
      }
      next(new Error("Unknown error"));
    }
  }

  async bindFileTo(req: Request, res: Response) {}

  async deleteFile(req: Request, res: Response) {}

  async changeFile(req: Request, res: Response) {}
}

export const imageController = new ImageController();

//Это уже финальный route handler, то есть контроллер.
// Он не ловит файл “с нуля”, а работает с уже обработанным request.

// Его задача:

// собрать URL
// добавить картинку в базу
// вернуть ответ клиенту через res.json(...)
