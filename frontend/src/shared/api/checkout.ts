import { $host } from ".";
import { CheckoutBody } from "../types/checkout.types";
import { CHECKOUT_URL } from "./endpoints";

export const createOrder = async (payload: CheckoutBody) => {
  const response = await $host.post(CHECKOUT_URL, payload);
  return response;
};
