// backend/src/middleware/security.middleware.ts
import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../config/env";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts" }, // 16-й запрос получит 429 Too Many Requests
});

export const checkoutRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many checkout requests" },
});

export const cdekRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many CDEK requests" },
});

export const paymentStatusRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many payment status requests" },
});

export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many webhook requests" },
});

export const verifyYouKassaWebhookSecret: RequestHandler = (req, res, next) => {
  const expectedSecret = env.YOUKASSA_WEBHOOK_SECRET;
  const receivedSecret = req.params.secret;

  if (receivedSecret !== expectedSecret) {
    return res.sendStatus(404);
  }

  next();
};
