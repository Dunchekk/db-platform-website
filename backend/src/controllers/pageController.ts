import type { Request, Response } from "express";
import { prisma } from "../db";

class PageController {
  async getApp(req: Request, res: Response) {}
}
export const pageController = new PageController();
