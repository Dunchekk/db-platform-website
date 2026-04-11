import ApiError from "../error/ApiError";

export function parseIdParam(rawId: string | string[]): number {
  if (Array.isArray(rawId)) {
    throw ApiError.badRequest("Invalid item id");
  }

  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    throw ApiError.badRequest("Invalid item id");
  }

  return id;
}
