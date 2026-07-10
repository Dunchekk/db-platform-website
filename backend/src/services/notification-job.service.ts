import { prisma } from "../db";
import { sendConfirmationOrderMail } from "./mail.service";

export async function claimNextNotificationJob() {
  const now = new Date();
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

    return prisma.notificationJob.findUnique({
      where: {
        id: pendingJob.id,
      },
    });
  } catch (e) {
    await markNotificationJobFailed(pendingJob.id);

    console.log(e);
    return null;
  }
}

export async function processNotificationJob(orderId: number) {
  await sendConfirmationOrderMail(orderId);
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
      },
    });

    if (!notification) {
      throw new Error("Did not find notification to update");
    }
  } catch (e) {
    await markNotificationJobFailed(id);
    console.log(e);
  }
}

export async function markNotificationJobFailed(id: number) {
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
        lastError: "",
      },
    });
    if (!notification) {
      throw new Error("Did not find notification to update");
    }

    const nextAttempts = notification.attempts;

    if (nextAttempts >= 3) {
      await prisma.notificationJob.update({
        where: {
          id: id,
        },
        data: {
          status: "FAILED",
          lockedAt: null,
          lastError: "",
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
}
