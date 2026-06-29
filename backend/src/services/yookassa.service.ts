import { ICreatePayment } from "@a2seven/yoo-checkout"; // OR const { YooCheckout } = require('@a2seven/yoo-checkout');
import { Order } from "@prisma/client";
import "dotenv";

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
      orderId, // нормальный
      paymentId, // нормальный
    },
  } as ICreatePayment;
}
