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
export const PAYMENT_STATUS_URL = (
  orderId: number | string,
  paymentId: number | string
) => `/api/payment/order/${orderId}/payment/${paymentId}/status`;

// CDEK
export const CDEK_GET_CITIES_URL = "/api/cdek/cities";
export const CDEK_GET_OFFICES_URL = "/api/cdek/delivery-points";
export const CDEK_GET_DELIVERY_PRICE_URL = "/api/cdek/delivery-price";

// ITEMS_URL для GET /items и POST /items
// ITEM_URL(id) для PUT /items/:id и DELETE /items/:id
// IMAGE_UPLOAD_URL(itemId) для POST /images/:id и для PATCH двух картинок
// IMAGE_URL(itemId, imageId) для DELETE одной картинки
// CHECKOUT_URL отдельно

// GET /api/cdek/cities?query=мос
// GET /api/cdek/delivery-points?city_code=44&weight=1200&length=40&width=30&height=8
// POST /api/cdek/delivery-price { city_code, items }
