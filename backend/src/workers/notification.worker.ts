import {
  claimNextNotificationJob,
  markNotificationJobFailed,
  markNotificationJobSent,
  processNotificationJob,
} from "../services/notification-job.service";
import { logEvents, logger } from "../lib/logger";

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function startWorker() {
  logger.info(logEvents.workerStarted, {});

  while (true) {
    const job = await claimNextNotificationJob();

    if (!job) {
      await sleep(3000);
      continue;
    }

    try {
      await processNotificationJob({
        id: job.id,
        orderId: job.orderId,
        shipmentId: job.shipmentId,
        type: job.type,
        attempts: job.attempts,
      });
      await markNotificationJobSent(job.id);
    } catch (e) {
      await markNotificationJobFailed(job.id, e);
      logger.error(logEvents.notificationJobFailed, {
        jobId: job.id,
        orderId: job.orderId,
        shipmentId: job.shipmentId,
        type: job.type,
        attempts: job.attempts,
        err: e,
      });
    }
  }
}

startWorker();
