import {
  NotificationJobStatus,
  Order,
  Payment,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "../db";
import { mapYooKassaStatus } from "../helpers/mapYooKassaStatus";
import { ProviderPaymentResult } from "../types/checkout.types";
import { YouKassa } from "./yookassa.service";
import {
  withTimeout,
  YOOKASSA_REQUEST_TIMEOUT_MS,
} from "../helpers/withTimeout";

const UNPAID_ORDER_RETENTION_DAYS = 30;
const PAYMENT_CONFIRMATION_URL_RETENTION_DAYS = 30;
const NOTIFICATION_JOB_ERROR_RETENTION_DAYS = 30;
const COMPLETED_ORDER_COMMENT_RETENTION_YEARS = 1;
const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = [
  "SUCCEEDED",
  "CANCELED",
  "FAILED",
];
const TERMINAL_NOTIFICATION_JOB_STATUSES: NotificationJobStatus[] = [
  "SENT",
  "FAILED",
];

type ProviderPaymentLookup = (
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

type OrderDeletionCandidate = Order & {
  currentPayment: Payment | null;
};

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

async function findOldUnpaidOrderCandidates({
  status,
  createdBefore,
  completedBefore,
}: {
  status: "PENDING_PAYMENT" | "CANCELLED";
  createdBefore?: Date;
  completedBefore?: Date;
}) {
  return prisma.order.findMany({
    where: {
      status,
      ...(createdBefore ? { createdAt: { lt: createdBefore } } : {}),
      ...(completedBefore ? { completedAt: { lt: completedBefore } } : {}),
      payments: {
        none: {
          status: "SUCCEEDED",
        },
      },
    },
    include: {
      currentPayment: true,
    },
  });
}

async function deleteEligibleOldOrders({
  orders,
  dryRun,
  getProviderPayment,
}: {
  orders: OrderDeletionCandidate[];
  dryRun: boolean;
  getProviderPayment: ProviderPaymentLookup;
}) {
  let deletedCount = 0;
  let skippedProviderSucceededCount = 0;
  let skippedProviderUnavailableCount = 0;

  for (const order of orders) {
    const providerCheck = await checkCurrentPaymentBeforeDeletion(
      order.currentPayment,
      getProviderPayment
    );

    if (providerCheck === "provider-succeeded") {
      skippedProviderSucceededCount += 1;
      continue;
    }

    if (providerCheck === "provider-unavailable") {
      skippedProviderUnavailableCount += 1;
      continue;
    }

    deletedCount += 1;

    if (!dryRun) {
      await prisma.order.delete({
        where: {
          id: order.id,
        },
      });
    }
  }

  return {
    deletedCount,
    skippedProviderSucceededCount,
    skippedProviderUnavailableCount,
  };
}

async function checkCurrentPaymentBeforeDeletion(
  currentPayment: Payment | null,
  getProviderPayment: ProviderPaymentLookup
) {
  if (!currentPayment) {
    return "can-delete";
  }

  if (currentPayment.status === "SUCCEEDED") {
    return "provider-succeeded";
  }

  if (
    currentPayment.status !== "PENDING" &&
    currentPayment.status !== "PROVIDER_UNKNOWN"
  ) {
    return "can-delete";
  }

  if (!currentPayment.providerPaymentId) {
    return "provider-unavailable";
  }

  try {
    const providerPayment = await getProviderPayment(
      currentPayment.providerPaymentId
    );
    const providerStatus = mapYooKassaStatus(providerPayment.status);

    if (providerStatus === "SUCCEEDED") {
      return "provider-succeeded";
    }

    if (providerStatus === "CANCELED" || providerStatus === "FAILED") {
      return "can-delete";
    }

    return "provider-unavailable";
  } catch {
    return "provider-unavailable";
  }
}

async function clearPaymentConfirmationUrls({
  dryRun,
  createdBefore,
}: {
  dryRun: boolean;
  createdBefore: Date;
}) {
  const where = {
    confirmationUrl: {
      not: null,
    },
    OR: [
      {
        status: {
          in: TERMINAL_PAYMENT_STATUSES,
        },
      },
      {
        createdAt: {
          lt: createdBefore,
        },
      },
    ],
  };

  if (dryRun) {
    return prisma.payment.count({ where });
  }

  const result = await prisma.payment.updateMany({
    where,
    data: {
      confirmationUrl: null,
    },
  });

  return result.count;
}

async function clearOldCompletedOrderComments({
  dryRun,
  completedBefore,
}: {
  dryRun: boolean;
  completedBefore: Date;
}) {
  const where = {
    completedAt: {
      lt: completedBefore,
    },
    comment: {
      not: null,
    },
  };

  if (dryRun) {
    return prisma.order.count({ where });
  }

  const result = await prisma.order.updateMany({
    where,
    data: {
      comment: null,
    },
  });

  return result.count;
}

async function clearCompletedOrderTelegrams({ dryRun }: { dryRun: boolean }) {
  const where = {
    completedAt: {
      not: null,
    },
    telegram: {
      not: null,
    },
  };

  if (dryRun) {
    return prisma.order.count({ where });
  }

  const result = await prisma.order.updateMany({
    where,
    data: {
      telegram: null,
    },
  });

  return result.count;
}

async function clearOldNotificationJobErrors({
  dryRun,
  updatedBefore,
}: {
  dryRun: boolean;
  updatedBefore: Date;
}) {
  const where = {
    status: {
      in: TERMINAL_NOTIFICATION_JOB_STATUSES,
    },
    updatedAt: {
      lt: updatedBefore,
    },
    lastError: {
      not: null,
    },
  };

  if (dryRun) {
    return prisma.notificationJob.count({ where });
  }

  const result = await prisma.notificationJob.updateMany({
    where,
    data: {
      lastError: null,
    },
  });

  return result.count;
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
