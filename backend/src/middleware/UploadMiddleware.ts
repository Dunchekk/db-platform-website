import multer from "multer";
import path from "path";
import { sanitizeFilename } from "../helpers/sanitizeFilename";

const uploadPath = path.resolve(__dirname, "../static/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, req.params.id + "_" + sanitizeFilename(file.originalname));
  },
});

const upload = multer({ storage: storage });

export const uploadMiddleware = upload.single("image");
