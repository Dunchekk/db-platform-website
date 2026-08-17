import {
  NotificationJobStatus,
  Order,
  Payment,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "../../db";
import { mapYooKassaStatus } from "../../helpers/mapYooKassaStatus";
import { ProviderPaymentLookup } from "../../types/retention.types";

const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = [
  "SUCCEEDED",
  "CANCELED",
  "FAILED",
];
const TERMINAL_NOTIFICATION_JOB_STATUSES: NotificationJobStatus[] = [
  "SENT",
  "FAILED",
];

type UnpaidOrderStatus = "PENDING_PAYMENT" | "CANCELLED";

type OrderDeletionCandidate = Order & {
  currentPayment: Payment | null;
};

export async function findOldUnpaidOrderCandidates({
  status,
  createdBefore,
  completedBefore,
}: {
  status: UnpaidOrderStatus;
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

export async function deleteEligibleOldOrders({
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

export async function clearPaymentConfirmationUrls({
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

export async function clearOldCompletedOrderComments({
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

export async function clearCompletedOrderTelegrams({
  dryRun,
}: {
  dryRun: boolean;
}) {
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

export async function clearOldNotificationJobErrors({
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
