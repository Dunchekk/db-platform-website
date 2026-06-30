import { ICreatePayment } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { Order } from "@prisma/client";
import { YooCheckout } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');

import "dotenv";

const YOUKASSA_SECRET_KEY = process.env.YOUKASSA_SECRET_KEY as string;
const SHOP_ID = process.env.SHOP_ID as string;

export const YouKassa = new YooCheckout({
  shopId: SHOP_ID,
  secretKey: YOUKASSA_SECRET_KEY,
});

export async function CreatePayload(
  order: Order,
  orderId: number,
  paymentId: number
) {
  return {
    amount: {
      value: String(order.total) + ".00",
      currency: "RUB",
    },
    capture: true, // не нужна ручная стадия “подтвердить списание позже”
    payment_method_data: {
      type: "bank_card",
    },
    confirmation: {
      type: "redirect",
      return_url: process.env.FRONTEND_RETURN_URL,
    },
    metadata: {
      time: Date.now().toString(),
      orderId,
      paymentId,
    },
  } as ICreatePayment;
}
