import { prisma } from "../../db";
import ApiError from "../../error/ApiError";
import { getCurrentCdekStatusCode } from "../../helpers/getCurrentCdekStatusCode";
import { logEvents, logger } from "../../lib/logger";
import { cdekShipmentResponce } from "../../types/cdek.types";
import { enqueueShipmentCreatedEmail } from "../notification.service";

const CDEK_SHIPMENT_POLL_ATTEMPTS = 4;
const CDEK_SHIPMENT_POLL_DELAY_MS = 1500;

type WaitForCdekShipmentParams = {
  orderId: number;
  providerShipmentId?: string | null;
  fetchShipment: (params: {
    providerShipmentId?: string | null;
    trackingNumber?: string | null;
    orderId?: number | null;
  }) => Promise<cdekShipmentResponce>;
};

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForCdekShipment({
  orderId,
  providerShipmentId,
  fetchShipment,
}: WaitForCdekShipmentParams) {
  // несколько раз опрашиваем cdek -- номер отслеживания может появиться не сразу
  let lastPollError: unknown = null;

  for (let attempt = 0; attempt < CDEK_SHIPMENT_POLL_ATTEMPTS; attempt++) {
    const cdekShipmentInfo = await fetchShipment({
      providerShipmentId,
      orderId: providerShipmentId ? null : orderId,
    }).catch((e) => {
      lastPollError = e;
      return null;
    });

    if (cdekShipmentInfo) {
      lastPollError = null;
    }

    const cdekShipmentStatus = cdekShipmentInfo
      ? getCurrentCdekStatusCode(cdekShipmentInfo)
      : null;
    const lastRequest =
      cdekShipmentInfo?.requests?.[cdekShipmentInfo.requests.length - 1];

    // если cdek вернул невалидный статус, дальше ретраить бессмысленно
    if (cdekShipmentStatus === "INVALID" || lastRequest?.state === "INVALID") {
      logger.error(logEvents.cdekShipmentInvalidStatus, {
        orderId,
        providerShipmentId,
        attempt: attempt + 1,
        cdekShipmentStatus,
        cdekRequestState: lastRequest?.state,
        cdekRequestErrorCodes: lastRequest?.errors?.map(
          (error) => error.code
        ),
        cdekRequestWarningCodes: lastRequest?.warnings?.map(
          (warning) => warning.code
        ),
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
    if (attempt < CDEK_SHIPMENT_POLL_ATTEMPTS - 1) {
      logger.warn(logEvents.cdekShipmentPollRetry, {
        orderId,
        providerShipmentId,
        attempt: attempt + 1,
        nextAttemptDelayMs: CDEK_SHIPMENT_POLL_DELAY_MS,
        cdekShipmentStatus,
        cdekRequestState: lastRequest?.state,
        cdekRequestErrorCodes: lastRequest?.errors?.map(
          (error) => error.code
        ),
        cdekRequestWarningCodes: lastRequest?.warnings?.map(
          (warning) => warning.code
        ),
        cdekNumber: cdekShipmentInfo?.entity?.cdek_number,
        err: lastPollError,
      });
      await wait(CDEK_SHIPMENT_POLL_DELAY_MS);
    }
  }

  logger.warn(logEvents.cdekShipmentPollExhausted, {
    orderId,
    providerShipmentId,
    attempts: CDEK_SHIPMENT_POLL_ATTEMPTS,
    pollDelayMs: CDEK_SHIPMENT_POLL_DELAY_MS,
    err: lastPollError,
  });

  return prisma.shipment.findUnique({
    where: {
      orderId,
    },
  });
}
