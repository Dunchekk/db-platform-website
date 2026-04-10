import type { Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";

class AuthController {
  async registration(req: Request, res: Response) {}

  async login(req: Request, res: Response) {}

  async logOut(req: Request, res: Response) {}

  async checkAuth(req: Request, res: Response, next: NextFunction) {
    const { id } = req.query;
    if (!id) {
      return next(ApiError.badRequest("No id attribute"));
    }
    res.json(id);
  }
}

export const authController = new AuthController();
