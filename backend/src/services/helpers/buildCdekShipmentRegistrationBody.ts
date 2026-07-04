import { Order, OrderItem } from "@prisma/client";
import { validatePhone } from "../../helpers/validation";
import { CdekCreatingOrderBody } from "../../types/cdek.types";

type CdekOrderPropertiesForRegistrationBody = {
  baseWeight: string;
  length: string;
  width: string;
  height: string;
  tariffCode: number;
  name: string;
  inn: string;
  phone: string;
  shipmentPoint: string;
};

export function buildCdekShipmentRegistrationBody(
  order: Order & { items: OrderItem[] },
  cdekOrderProperties: CdekOrderPropertiesForRegistrationBody
): CdekCreatingOrderBody {
  const packageItems = order.items.map((item) => ({
    name: item.title,
    ware_key: String(item.itemId ?? item.id),
    payment: {
      value: item.price,
    },
    weight: cdekOrderProperties.baseWeight,
    amount: item.quantity,
    cost: item.price,
    marking: null,
  })) as unknown as CdekCreatingOrderBody["packages"][number]["items"];

  return {
    type: 1,
    number: String(order.id),
    tariff_code: cdekOrderProperties.tariffCode,
    comment: order.comment || undefined,
    delivery_point: order?.deliveryOfficeCode,
    shipment_point: cdekOrderProperties.shipmentPoint,
    seller: {
      name: cdekOrderProperties.name,
      inn: cdekOrderProperties.inn,
      phone: cdekOrderProperties.phone,
    },
    recipient: {
      name: [order.lastName, order.firstName, order.patronymic]
        .filter(Boolean)
        .join(" "),
      email: `${order?.email}`,
      phones: [{ number: `${validatePhone(order?.phone)}` }],
    },
    packages: [
      {
        number: String(order.id),
        weight: Number(cdekOrderProperties.baseWeight) * packageItems.length,
        width: Number(cdekOrderProperties.width),
        height: Number(cdekOrderProperties.height),
        length: Number(cdekOrderProperties.length),
        items: packageItems,
        package_id: null,
      },
    ],
  };
}
