import {
  claimNextNotificationJob,
  markNotificationJobFailed,
  markNotificationJobSent,
  processNotificationJob,
} from "../services/notification-job.service";

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function startWorker() {
  while (true) {
    const job = await claimNextNotificationJob();

    if (!job) {
      await sleep(3000);
      continue;
    }

    try {
      await processNotificationJob(job.orderId);
      await markNotificationJobSent(job.id);
    } catch (e) {
      await markNotificationJobFailed(job.id, e);
      console.log(e);
    }
  }
}

startWorker();
