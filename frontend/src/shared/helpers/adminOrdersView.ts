import type { AdminOrder } from "@/shared/types/admin-orders.types";

export function formatAdminOrderDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatAdminOrderMoney(value: number) {
  return `${value}\u00A0₽`;
}

export function canRetryAdminOrderShipment(order: AdminOrder) {
  const isPaid =
    order.currentPayment?.status === "SUCCEEDED" ||
    order.status === "PAID" ||
    order.status === "FULFILLMENT_PENDING";

  if (!isPaid) {
    return false;
  }

  if (!order.shipment) {
    return true;
  }

  if (
    order.shipment.status === "FAILED" ||
    order.shipment.status === "CANCELED"
  ) {
    return true;
  }

  return order.shipment.status === "PENDING" && !order.shipment.trackingNumber;
}
