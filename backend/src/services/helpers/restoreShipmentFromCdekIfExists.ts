import { prisma } from "../../db";
import { getCurrentCdekStatusCode } from "../../helpers/getCurrentCdekStatusCode";
import { cdekShipmentResponce } from "../../types/cdek.types";

type RestoreShipmentFromCdekIfExistsParams = {
  orderId: number;
  fetchShipment: (params: {
    trackingNumber?: string | null;
    orderId?: number | null;
  }) => Promise<cdekShipmentResponce>;
};

export async function restoreShipmentFromCdekIfExists({
  orderId,
  fetchShipment,
}: RestoreShipmentFromCdekIfExistsParams) {
  const existingCdekShipment = await fetchShipment({
    orderId,
  }).catch(() => null);

  const existingCdekShipmentStatus = existingCdekShipment
    ? getCurrentCdekStatusCode(existingCdekShipment)
    : null;

  if (
    !existingCdekShipment?.entity?.uuid ||
    existingCdekShipmentStatus === "INVALID" ||
    existingCdekShipmentStatus === "NOT_DELIVERED" ||
    existingCdekShipmentStatus === "REMOVED"
  ) {
    return null;
  }

  const restoredTrackingNumber = existingCdekShipment.entity.cdek_number
    ? String(existingCdekShipment.entity.cdek_number)
    : null;

  const restoredShipment = await prisma.shipment.update({
    where: {
      orderId,
    },
    data: {
      status: "CREATED",
      providerShipmentId: existingCdekShipment.entity.uuid,
      trackingNumber: restoredTrackingNumber,
    },
  });

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "FULFILLMENT_PENDING",
    },
  });

  return restoredShipment;
}
