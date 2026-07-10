import { prisma } from "../../db";
import ApiError from "../../error/ApiError";
import { getCurrentCdekStatusCode } from "../../helpers/getCurrentCdekStatusCode";
import { cdekShipmentResponce } from "../../types/cdek.types";
import { enqueueShipmentCreatedEmail } from "../notification.service";

type WaitForCdekShipmentParams = {
  orderId: number;
  fetchShipment: (params: {
    trackingNumber?: string | null;
    orderId?: number | null;
  }) => Promise<cdekShipmentResponce>;
};

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForCdekShipment({
  orderId,
  fetchShipment,
}: WaitForCdekShipmentParams) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const cdekShipmentInfo = await fetchShipment({
      orderId,
    }).catch(() => null);

    const cdekShipmentStatus = cdekShipmentInfo
      ? getCurrentCdekStatusCode(cdekShipmentInfo)
      : null;

    if (cdekShipmentStatus === "INVALID") {
      throw ApiError.badGateway(
        "CDEK shipment was created but returned INVALID status"
      );
    }

    // если достучались то обновляем параметры трекинга
    if (
      cdekShipmentInfo?.entity?.uuid &&
      cdekShipmentInfo.entity?.cdek_number
    ) {
      const trackingNumber = String(cdekShipmentInfo.entity.cdek_number);

      const updatedShipment = await prisma.shipment.update({
        where: {
          orderId,
        },
        data: {
          status: "CREATED",
          trackingNumber,
        },
      });

      const order = await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: "FULFILLMENT_PENDING",
        },
      });

      await enqueueShipmentCreatedEmail(
        order.id,
        updatedShipment.id,
        "SHIPMENT_CREATED_EMAIL"
      );

      return updatedShipment;
    }

    if (attempt < 2) {
      await wait(700);
    }
  }

  // возвращаем наш объект доставки
  return prisma.shipment.findUnique({
    where: {
      orderId,
    },
  });
}
