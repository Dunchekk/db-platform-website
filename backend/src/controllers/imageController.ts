import type { Request, Response } from "express";

class ImageController {
  async getAllFiles(req: Request, res: Response) {}

  async uploadFile(req: Request, res: Response) {}

  async bindFileTo(req: Request, res: Response) {}

  async deleteFile(req: Request, res: Response) {}

  async changeFile(req: Request, res: Response) {}
}

export const imageController = new ImageController();
