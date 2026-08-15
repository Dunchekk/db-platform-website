import { ProviderPaymentResult } from "../types/checkout.types";
import { mapYooKassaStatus } from "./mapYooKassaStatus";

export function buildPaymentUpdateFromProvider(
  providerPayment: ProviderPaymentResult
) {
  const status = mapYooKassaStatus(providerPayment.status);

  return {
    providerPaymentId: providerPayment.id,
    confirmationUrl:
      status === "PENDING"
        ? providerPayment.confirmation.confirmation_url ?? null
        : null,
    status,
    paidAt: providerPayment.paid ? new Date() : null,
  };
}
