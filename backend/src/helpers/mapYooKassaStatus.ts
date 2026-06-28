import { IPaymentStatus } from "@a2seven/yoo-checkout";
import { PaymentStatus } from "@prisma/client";

export const mapYooKassaStatus = (s: IPaymentStatus): PaymentStatus => {
  switch (s) {
    case "waiting_for_capture":
      return "PENDING";
    case "pending":
      return "PENDING";
    case "succeeded":
      return "SUCCEEDED";
    case "canceled":
      return "CANCELED";
    default:
      return "PENDING";
  }
}; // "waiting_for_capture" | "pending" | "succeeded" | "canceled"
