import { env } from "../config/env";

export function buildFrontendPaymentReturnUrl(
  orderId: number,
  paymentId: number
): string {
  const baseReturnUrl = env.FRONTEND_RETURN_URL;
  const returnUrl = new URL(baseReturnUrl);

  returnUrl.searchParams.set("paymentReturn", "1");
  returnUrl.searchParams.set("orderId", String(orderId));
  returnUrl.searchParams.set("paymentId", String(paymentId));

  return returnUrl.toString();
}
