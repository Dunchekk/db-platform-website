import { $authHost } from ".";
import {
  AdminOrdersQuery,
  AdminOrdersResponse,
  AdminOrderShipment,
} from "@/shared/types/admin-orders.types";
import { ORDERS_URL, ORDER_RETRY_SHIPMENT_URL } from "./endpoints";

export const getAdminOrders = async (query: AdminOrdersQuery = {}) => {
  const params = new URLSearchParams();

  appendQueryParam(params, "page", query.page);
  appendQueryParam(params, "limit", query.limit);
  appendQueryParam(params, "search", query.search);
  appendQueryParam(params, "sortBy", query.sortBy);
  appendQueryParam(params, "sortDir", query.sortDir);

  const search = params.toString();
  const response = await $authHost.get(
    search ? `${ORDERS_URL}?${search}` : ORDERS_URL
  );

  return response as AdminOrdersResponse;
};

export const retryOrderShipment = async (orderId: number) => {
  const response = await $authHost.post(ORDER_RETRY_SHIPMENT_URL(orderId));

  return response as AdminOrderShipment;
};

function appendQueryParam(
  params: URLSearchParams,
  key: string,
  value: number | string | undefined
) {
  if (value === undefined || value === "") {
    return;
  }

  params.set(key, String(value));
}
