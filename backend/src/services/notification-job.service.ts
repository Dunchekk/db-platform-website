import { prisma } from "../db";
import { logEvents, logger } from "../lib/logger";
import { sendConfirmationOrderMail } from "./mail.service";

const NOTIFICATION_JOB_LOCK_TIMEOUT_MS = 15 * 60 * 1000;
const STALE_LOCK_LAST_ERROR = "Notification job lock expired and was requeued";

export async function claimNextNotificationJob() {
  const now = new Date();

  await requeueStaleProcessingNotificationJobs(now);

  const pendingJob = await prisma.notificationJob.findFirst({
    where: {
      status: "PENDING",
      runAt: {
        lte: now, // less than or equal.
      },
    },
    orderBy: {
      runAt: "asc", // asc = по возрастанию.
    },
  });

  if (!pendingJob) {
    return null;
  }

  try {
    const claimedJob = await prisma.notificationJob.updateMany({
      where: {
        id: pendingJob.id,
        status: "PENDING",
      },
      data: {
        status: "PROCESSING",
        lockedAt: now,
      },
    });

    if (claimedJob.count !== 1) {
      return null;
    }

    const job = await prisma.notificationJob.findUnique({
      where: {
        id: pendingJob.id,
      },
    });

    if (job) {
      logger.info(logEvents.notificationJobClaimed, {
        jobId: job.id,
        orderId: job.orderId,
        shipmentId: job.shipmentId,
        type: job.type,
        attempts: job.attempts,
        runAt: job.runAt,
      });
    }

    return job;
  } catch (e) {
    await markNotificationJobFailed(pendingJob.id, e);
    logger.error(logEvents.notificationJobFailed, {
      jobId: pendingJob.id,
      orderId: pendingJob.orderId,
      shipmentId: pendingJob.shipmentId,
      type: pendingJob.type,
      err: e,
    });
    return null;
  }
}

async function requeueStaleProcessingNotificationJobs(now: Date) {
  const lockedBefore = new Date(
    now.getTime() - NOTIFICATION_JOB_LOCK_TIMEOUT_MS
  );

  const result = await prisma.notificationJob.updateMany({
    where: {
      status: "PROCESSING",
      lockedAt: {
        lt: lockedBefore,
      },
    },
    data: {
      status: "PENDING",
      lockedAt: null,
      lastError: STALE_LOCK_LAST_ERROR,
    },
  });

  if (result.count > 0) {
    logger.warn(logEvents.notificationJobRequeued, {
      count: result.count,
      lockedBefore,
      reason: STALE_LOCK_LAST_ERROR,
    });
  }
}

export async function processNotificationJob(job: {
  id: number;
  orderId: number;
  shipmentId: number | null;
  type: string;
  attempts: number;
}) {
  logger.info(logEvents.notificationJobProcessingStarted, {
    jobId: job.id,
    orderId: job.orderId,
    shipmentId: job.shipmentId,
    type: job.type,
    attempts: job.attempts,
  });

  await sendConfirmationOrderMail(job.orderId);
}

export async function markNotificationJobSent(id: number) {
  try {
    const notification = await prisma.notificationJob.update({
      where: {
        id: id,
      },
      data: {
        status: "SENT",
        sentAt: new Date(),
        lockedAt: null,
        lastError: null,
      },
    });

    if (!notification) {
      throw new Error("Did not find notification to update");
    }

    logger.info(logEvents.notificationJobSent, {
      jobId: notification.id,
      orderId: notification.orderId,
      shipmentId: notification.shipmentId,
      type: notification.type,
      attempts: notification.attempts,
      sentAt: notification.sentAt,
    });
  } catch (e) {
    await markNotificationJobFailed(id, e);
    logger.error(logEvents.notificationJobFailed, {
      jobId: id,
      err: e,
    });
  }
}

export async function markNotificationJobFailed(id: number, e: unknown) {
  try {
    const notification = await prisma.notificationJob.update({
      where: {
        id: id,
      },
      data: {
        status: "PENDING",
        attempts: {
          increment: 1,
        },
        lockedAt: null,
        lastError: e instanceof Error ? e.message : String(e),
      },
    });
    if (!notification) {
      throw new Error("Did not find notification to update");
    }

    const nextAttempts = notification.attempts;

    if (nextAttempts >= 3) {
      const failedNotification = await prisma.notificationJob.update({
        where: {
          id: id,
        },
        data: {
          status: "FAILED",
          lockedAt: null,
          lastError: e instanceof Error ? e.message : String(e),
        },
      });

      logger.error(logEvents.notificationJobPermanentlyFailed, {
        jobId: failedNotification.id,
        orderId: failedNotification.orderId,
        shipmentId: failedNotification.shipmentId,
        type: failedNotification.type,
        attempts: failedNotification.attempts,
        err: e,
      });

      return;
    }

    logger.warn(logEvents.notificationJobRequeued, {
      jobId: notification.id,
      orderId: notification.orderId,
      shipmentId: notification.shipmentId,
      type: notification.type,
      attempts: notification.attempts,
      runAt: notification.runAt,
      err: e,
    });
  } catch (e) {
    logger.error(logEvents.notificationJobFailed, {
      jobId: id,
      err: e,
    });
  }
}
