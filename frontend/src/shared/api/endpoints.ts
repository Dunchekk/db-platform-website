export const AUTH_LOGIN_URL = "/api/auth/login";
export const AUTH_SESSION_URL = "/api/auth/session";

export const ITEMS_URL = "/api/items";
export const ITEM_URL = (id: number | string) => `/api/items/${id}`;

export const IMAGE_UPLOAD_URL = (itemId: number | string) => {
  return `/api/images/${itemId}`;
};

export const IMAGE_URL = (
  itemId: number | string,
  imageId: number | string
) => {
  return `/api/images/${itemId}/${imageId}`;
};

export const CHECKOUT_URL = "/api/checkout";

// ITEMS_URL для GET /items и POST /items
// ITEM_URL(id) для PUT /items/:id и DELETE /items/:id
// IMAGE_UPLOAD_URL(itemId) для POST /images/:id
// IMAGE_URL(itemId, imageId) для DELETE и PATCH одной картинки
// CHECKOUT_URL отдельно
