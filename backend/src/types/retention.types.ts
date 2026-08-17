import { ProviderPaymentResult } from "./checkout.types";

export type ProviderPaymentLookup = (
  providerPaymentId: string
) => Promise<ProviderPaymentResult>;

export type RetentionCleanupOptions = {
  dryRun: boolean;
  now?: Date;
  getProviderPayment?: ProviderPaymentLookup;
};

export type RetentionCleanupSummary = {
  oldPendingOrdersDeleted: number;
  oldCancelledOrdersDeleted: number;
  ordersSkippedProviderSucceeded: number;
  ordersSkippedProviderUnavailable: number;
  paymentConfirmationUrlsCleared: number;
  orderCommentsCleared: number;
  orderTelegramsCleared: number;
  notificationJobErrorsCleared: number;
};
