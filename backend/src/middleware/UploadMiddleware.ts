import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { sanitizeFilename } from "../helpers/sanitizeFilename";
import type { RequestHandler } from "express";
import ApiError from "../error/ApiError";

const uploadPath = path.resolve(__dirname, "../static/uploads");
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniquePart = `${Date.now()}_${randomUUID()}`;
    cb(
      null,
      `${req.params.id}_${uniquePart}_${sanitizeFilename(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  defParamCharset: "utf8",
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: function (req, file, cb) {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
});

const uploadSingleImage = upload.single("image");

export const uploadMiddleware: RequestHandler = (req, res, next) => {
  uploadSingleImage(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(ApiError.badRequest("Image file is too large"));
      return;
    }

    next(err);
  });
};
