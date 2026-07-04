import { $host } from ".";
import {
  CheckPaymentStatusResponse,
  CheckoutBody,
  CreateOrderResponse,
} from "../types/checkout.types";
import { CHECKOUT_URL, PAYMENT_STATUS_URL } from "./endpoints";

export const createOrder = async (payload: CheckoutBody) => {
  const response = await $host.post(CHECKOUT_URL, payload);
  return response as CreateOrderResponse;
};

export const checkPaymentStatus = async (
  orderId: number,
  paymentId: number
) => {
  const response = await $host.get(PAYMENT_STATUS_URL(orderId, paymentId));
  return response as CheckPaymentStatusResponse;
};
