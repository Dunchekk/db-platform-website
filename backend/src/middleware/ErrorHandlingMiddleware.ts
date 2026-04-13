import ApiError from "../error/ApiError";
import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: "unpredict error" });
};

export default errorHandler;
