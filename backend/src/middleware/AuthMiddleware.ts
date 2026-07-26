import { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env";

const authMiddleware: RequestHandler = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer lkdfmblfd...
    const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);
    if (!token) {
      return res.status(401).json({ message: "User is not authorized" });
    }

    const { payload } = await jwtVerify(token, jwtSecret);

    req.user = {
      sub: payload.sub,
      role: typeof payload.role === "string" ? payload.role : undefined,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: err instanceof Error ? err.message : "User is not authorized",
    });
  }
};

export default authMiddleware;
