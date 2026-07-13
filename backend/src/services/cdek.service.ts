import "dotenv/config";
import ApiError from "../error/ApiError";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { buildCdekShipmentRegistrationBody } from "./helpers/buildCdekShipmentRegistrationBody";
import { restoreShipmentFromCdekIfExists } from "./helpers/restoreShipmentFromCdekIfExists";
import { waitForCdekShipment } from "./helpers/waitForCdekShipment";
import { createCdekOrder, fetchCdekShipment } from "./cdek.api";
import { cdekOrderProperties } from "./cdek.config";
import { logEvents, logger } from "../lib/logger";

//-------------------------

export async function createCdekShipmentForPaidOrder(orderId: number) {
  logger.info(logEvents.cdekShipmentCreateStarted, {
    orderId,
  });

  // смотрим есть ли запись достаки у этого заказа (одна запись на 1 заказ)
  let canCreateRemoteShipment = false;
  let shipment = await prisma.shipment.findUnique({
    where: {
      orderId,
    },
  });

  if (!shipment) {
    try {
      shipment = await prisma.shipment.create({
        data: {
          orderId,
          status: "PENDING",
        },
      });
      canCreateRemoteShipment = true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
        // Если два потока одновременно пытаются создать одну и ту же Shipment,
        // один create пройдет, второй упадет с Prisma P2002. Не валим процесс,
        // дочитываем уже созданную запись
      ) {
        shipment = await prisma.shipment.findUnique({
          where: {
            orderId,
          },
        });
      } else {
        throw e;
      }
    }
  }

  if (!shipment) {
    throw ApiError.internal("Failed to acquire local shipment lock");
  }

  // если у найденной записи все ок по статусам, есть айди, не можем делать новую регистрацию, то возвращаем ее
  if (
    shipment.status === "CREATED" ||
    shipment.status === "IN_TRANSIT" ||
    shipment.status === "READY_FOR_PICKUP" ||
    shipment.status === "DELIVERED"
  ) {
    logger.info(logEvents.cdekShipmentCreateSkippedExisting, {
      orderId,
      shipmentId: shipment.id,
      shipmentStatus: shipment.status,
      providerShipmentId: shipment.providerShipmentId,
    });
    return shipment;
  }

  if (shipment.status === "PENDING" && shipment.providerShipmentId) {
    logger.info(logEvents.cdekShipmentCreateSkippedExisting, {
      orderId,
      shipmentId: shipment.id,
      shipmentStatus: shipment.status,
      providerShipmentId: shipment.providerShipmentId,
    });
    return shipment;
  }

  if (shipment.status === "PENDING" && !canCreateRemoteShipment) {
    logger.info(logEvents.cdekShipmentCreateSkippedExisting, {
      orderId,
      shipmentId: shipment.id,
      shipmentStatus: shipment.status,
      providerShipmentId: shipment.providerShipmentId,
    });
    return shipment;
  }

  // если у найденной записи все упало то будем с ней работать, и перепишем ее на рабочую
  if (shipment.status === "FAILED" || shipment.status === "CANCELED") {
    // проверим еще в сдеке -- дейсствительно ли все упало. если на ремоуте все ок то возрождаем старую запись
    const restoredShipment = await restoreShipmentFromCdekIfExists({
      orderId,
      fetchShipment: fetchCdekShipment,
    });

    if (restoredShipment) {
      logger.info(logEvents.cdekShipmentRestored, {
        orderId,
        shipmentId: restoredShipment.id,
        shipmentStatus: restoredShipment.status,
        providerShipmentId: restoredShipment.providerShipmentId,
      });
      return restoredShipment;
    }

    const claimedShipment = await prisma.shipment.updateMany({
      where: {
        id: shipment.id,
        status: shipment.status,
      },
      data: {
        status: "PENDING",
        providerShipmentId: null,
        trackingNumber: null,
        trackingUrl: null,
      },
    });

    // ↑ Два разных процесса (или запроса от пользователя) одновременно пытаются
    // обработать один и тот же заказ, у которого статус FAILED или CANCELED.
    // Если бы они оба просто прочитали статус, увидели, что он «плохой»,
    // и пошли создавать отправку в СДЭК, то для одного заказа создалось
    // бы два дубликата в СДЭКе.

    if (!claimedShipment.count) {
      // если count === 1, значит именно этот поток успел перевести запись из FAILED/CANCELED в PENDING и может идти дальше в CDEK
      return prisma.shipment.findUnique({
        where: {
          orderId,
        },
      });
    }
  }

  // собрать payload только из server-side данных заказа:
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  if (!order) throw new Error("Order not found");

  const body = buildCdekShipmentRegistrationBody(order, cdekOrderProperties);

  try {
    const responseBody = await createCdekOrder(body);

    // проверка статуса (последнего во всех статусах)
    const lastRequest = responseBody.requests[responseBody.requests.length - 1];

    if (!responseBody.entity?.uuid || lastRequest?.state === "INVALID") {
      const cdekError = lastRequest?.errors
        ?.map((item) => item.message)
        .join("; ");
      throw ApiError.badGateway(
        `CDEK shipment creation failed${cdekError ? `: ${cdekError}` : ""}`
      );
    }

    await prisma.shipment.update({
      where: {
        orderId,
      },
      data: {
        providerShipmentId: responseBody.entity.uuid,
      },
    });

    logger.info(logEvents.cdekShipmentRemoteCreateSucceeded, {
      orderId,
      shipmentId: shipment.id,
      providerShipmentId: responseBody.entity.uuid,
    });

    return waitForCdekShipment({
      orderId,
      fetchShipment: fetchCdekShipment,
    });
  } catch (e) {
    logger.error(logEvents.cdekShipmentRemoteCreateFailed, {
      orderId,
      shipmentId: shipment.id,
      shipmentStatus: shipment.status,
      err: e,
    });

    await prisma.shipment.update({
      where: {
        orderId,
      },
      data: {
        status: "FAILED",
      },
    });

    throw e;
  }
} // доделать хелперы и рефактор.
