import { $host } from ".";
import { CheckoutBody, CreateOrderResponse } from "../types/checkout.types";
import { CHECKOUT_URL } from "./endpoints";

export const createOrder = async (payload: CheckoutBody) => {
  const response = await $host.post(CHECKOUT_URL, payload);
  return response.data as CreateOrderResponse;
};
