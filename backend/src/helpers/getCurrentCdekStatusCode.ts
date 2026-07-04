import { CdekOrderStatusCode, cdekShipmentResponce } from "../types/cdek.types";

export const getCurrentCdekStatusCode = (
  shipment: cdekShipmentResponce
): CdekOrderStatusCode | null => {
  const currentStatus =
    shipment.entity?.statuses?.[(shipment.entity.statuses.length ?? 1) - 1];

  return currentStatus?.code ?? null;
};
