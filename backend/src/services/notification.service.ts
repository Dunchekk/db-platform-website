import { NotificationJobType } from "@prisma/client";
import { prisma } from "../db";

export async function enqueueShipmentCreatedEmail(
  orderId: number,
  shipmentId: number,
  type: NotificationJobType
) {
  await prisma.notificationJob.upsert({
    where: {
      type_orderId: {
        type: type,
        orderId,
      },
    },
    update: {},
    create: {
      type: type,
      orderId,
      shipmentId,
    },
  });
}
