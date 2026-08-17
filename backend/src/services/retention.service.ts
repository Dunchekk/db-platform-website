import {
  withTimeout,
  YOOKASSA_REQUEST_TIMEOUT_MS,
} from "../helpers/withTimeout";
import { ProviderPaymentResult } from "../types/checkout.types";
import {
  RetentionCleanupOptions,
  RetentionCleanupSummary,
} from "../types/retention.types";
import {
  clearCompletedOrderTelegrams,
  clearOldCompletedOrderComments,
  clearOldNotificationJobErrors,
  clearPaymentConfirmationUrls,
  deleteEligibleOldOrders,
  findOldUnpaidOrderCandidates,
} from "./helpers/retentionCleanupTasks";
import { YouKassa } from "./yookassa.service";

const UNPAID_ORDER_RETENTION_DAYS = 30;
const PAYMENT_CONFIRMATION_URL_RETENTION_DAYS = 30;
const NOTIFICATION_JOB_ERROR_RETENTION_DAYS = 30;
const COMPLETED_ORDER_COMMENT_RETENTION_YEARS = 1;

export async function runRetentionCleanup({
  dryRun,
  now = new Date(),
  getProviderPayment = getYooKassaPayment,
}: RetentionCleanupOptions): Promise<RetentionCleanupSummary> {
  const unpaidOrderCutoff = subtractDays(now, UNPAID_ORDER_RETENTION_DAYS);
  const paymentUrlCutoff = subtractDays(
    now,
    PAYMENT_CONFIRMATION_URL_RETENTION_DAYS
  );
  const notificationJobErrorCutoff = subtractDays(
    now,
    NOTIFICATION_JOB_ERROR_RETENTION_DAYS
  );
  const completedOrderCommentCutoff = subtractYears(
    now,
    COMPLETED_ORDER_COMMENT_RETENTION_YEARS
  );

  const summary: RetentionCleanupSummary = {
    oldPendingOrdersDeleted: 0,
    oldCancelledOrdersDeleted: 0,
    ordersSkippedProviderSucceeded: 0,
    ordersSkippedProviderUnavailable: 0,
    paymentConfirmationUrlsCleared: 0,
    orderCommentsCleared: 0,
    orderTelegramsCleared: 0,
    notificationJobErrorsCleared: 0,
  };

  const oldPendingOrders = await findOldUnpaidOrderCandidates({
    status: "PENDING_PAYMENT",
    createdBefore: unpaidOrderCutoff,
  });
  const pendingOrderResult = await deleteEligibleOldOrders({
    orders: oldPendingOrders,
    dryRun,
    getProviderPayment,
  });

  summary.oldPendingOrdersDeleted = pendingOrderResult.deletedCount;
  summary.ordersSkippedProviderSucceeded +=
    pendingOrderResult.skippedProviderSucceededCount;
  summary.ordersSkippedProviderUnavailable +=
    pendingOrderResult.skippedProviderUnavailableCount;

  const oldCancelledOrders = await findOldUnpaidOrderCandidates({
    status: "CANCELLED",
    completedBefore: unpaidOrderCutoff,
  });
  const cancelledOrderResult = await deleteEligibleOldOrders({
    orders: oldCancelledOrders,
    dryRun,
    getProviderPayment,
  });

  summary.oldCancelledOrdersDeleted = cancelledOrderResult.deletedCount;
  summary.ordersSkippedProviderSucceeded +=
    cancelledOrderResult.skippedProviderSucceededCount;
  summary.ordersSkippedProviderUnavailable +=
    cancelledOrderResult.skippedProviderUnavailableCount;

  summary.paymentConfirmationUrlsCleared =
    await clearPaymentConfirmationUrls({
      dryRun,
      createdBefore: paymentUrlCutoff,
    });
  summary.orderCommentsCleared = await clearOldCompletedOrderComments({
    dryRun,
    completedBefore: completedOrderCommentCutoff,
  });
  summary.orderTelegramsCleared = await clearCompletedOrderTelegrams({
    dryRun,
  });
  summary.notificationJobErrorsCleared =
    await clearOldNotificationJobErrors({
      dryRun,
      updatedBefore: notificationJobErrorCutoff,
    });

  return summary;
}

function subtractDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function subtractYears(date: Date, years: number) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
}

function getYooKassaPayment(providerPaymentId: string) {
  return withTimeout(
    YouKassa.getPayment(providerPaymentId),
    YOOKASSA_REQUEST_TIMEOUT_MS,
    "YooKassa get payment timed out"
  ) as Promise<ProviderPaymentResult>;
}
