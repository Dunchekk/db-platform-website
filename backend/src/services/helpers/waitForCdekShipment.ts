import { prisma } from "../../db";
import ApiError from "../../error/ApiError";
import { getCurrentCdekStatusCode } from "../../helpers/getCurrentCdekStatusCode";
import { logEvents, logger } from "../../lib/logger";
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
  // несколько раз опрашиваем cdek -- номер отслеживания может появиться не сразу
  for (let attempt = 0; attempt < 3; attempt++) {
    const cdekShipmentInfo = await fetchShipment({
      orderId,
    }).catch(() => null);

    const cdekShipmentStatus = cdekShipmentInfo
      ? getCurrentCdekStatusCode(cdekShipmentInfo)
      : null;

    // если cdek вернул невалидный статус, дальше ретраить бессмысленно
    if (cdekShipmentStatus === "INVALID") {
      logger.error(logEvents.cdekShipmentInvalidStatus, {
        orderId,
        attempt: attempt + 1,
      });
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

      logger.info(logEvents.cdekShipmentCreatedConfirmed, {
        orderId,
        shipmentId: updatedShipment.id,
        shipmentStatus: updatedShipment.status,
        providerShipmentId: updatedShipment.providerShipmentId,
        trackingNumber,
      });

      // после подтверждения отправки переводим заказ в ожидание фулфилмента
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

    // если данных пока не хватило, даем cdek время и пробуем еще раз
    if (attempt < 2) {
      logger.warn(logEvents.cdekShipmentPollRetry, {
        orderId,
        attempt: attempt + 1,
      });
      await wait(700);
    }
  }

  return prisma.shipment.findUnique({
    where: {
      orderId,
    },
  });
}
