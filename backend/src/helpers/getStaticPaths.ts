import path from "path";
import ApiError from "../error/ApiError";

export const getStaticRoot = () => {
  return path.resolve(__dirname, "../static");
};

export const getAbsoluteImagePath = (imageUrl: string) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw ApiError.badRequest("Invalid image url");
  }
  if (!imageUrl.startsWith("/uploads")) {
    throw ApiError.badRequest("Image url is outside uploads directory");
  }

  const staticRoot = getStaticRoot();

  return path.join(staticRoot, imageUrl.slice(1)); // path.join не любит ведущий "/"
};
