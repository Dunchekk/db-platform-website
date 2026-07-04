import { Order, OrderItem } from "@prisma/client";
import { validatePhone } from "../../helpers/validation";
import { CdekCreatingOrderBody } from "../../types/cdek.types";

type CdekOrderPropertiesForRegistrationBody = {
  base_weight: string;
  length: string;
  width: string;
  height: string;
  tarrif_code: number;
  name: string;
  inn: string;
  phone: string;
  shipment_point: string;
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
    weight: cdekOrderProperties.base_weight,
    amount: item.quantity,
    cost: item.price,
    marking: null,
  })) as unknown as CdekCreatingOrderBody["packages"][number]["items"];

  return {
    type: 1,
    number: String(order.id),
    tariff_code: cdekOrderProperties.tarrif_code,
    comment: order.comment || undefined,
    delivery_point: order?.deliveryOfficeCode,
    shipment_point: cdekOrderProperties.shipment_point,
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
        weight: Number(cdekOrderProperties.base_weight) * packageItems.length,
        width: Number(cdekOrderProperties.width),
        height: Number(cdekOrderProperties.height),
        length: Number(cdekOrderProperties.length),
        items: packageItems,
        package_id: null,
      },
    ],
  };
}
