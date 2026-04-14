import type { Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";
import argon2 from "argon2";
import "dotenv/config";
import { SignJWT } from "jose";

const adminEmail = process.env.ADMIN_EMAIL!;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH!;
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest("Email and password are requied"));
    }

    if (email !== adminEmail) {
      return next(ApiError.badRequest("Email/password is incorrect"));
    }

    const isValidPassword = await argon2.verify(adminPasswordHash, password);

    if (!isValidPassword) {
      return next(ApiError.badRequest("Email/password is incorrect"));
    }

    const token = await new SignJWT({ role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(jwtSecret);

    return res.json({ token });
  }

  async checkAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return next(ApiError.forbidden("User is not authorized"));
    }

    return res.json({
      user: req.user,
    });
  }
}

export const authController = new AuthController();
