import { ProviderPaymentResult } from "../types/checkout.types";
import { mapYooKassaStatus } from "./mapYooKassaStatus";

export function buildPaymentUpdateFromProvider(
  providerPayment: ProviderPaymentResult
) {
  return {
    providerPaymentId: providerPayment.id,
    confirmationUrl: providerPayment.confirmation.confirmation_url ?? null,
    status: mapYooKassaStatus(providerPayment.status),
    paidAt: providerPayment.paid ? new Date() : null,
  };
}
