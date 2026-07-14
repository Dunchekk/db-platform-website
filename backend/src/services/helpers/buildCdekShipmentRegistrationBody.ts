import { Order, OrderItem } from "@prisma/client";
import { validatePhone } from "../../helpers/validation";
import { CdekCreatingOrderBody } from "../../types/cdek.types";

type CdekOrderPropertiesForRegistrationBody = {
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
  const packages = order.items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, index) => ({
      number: `${order.id}-${item.id}-${index + 1}`,
      weight: item.packageWeightGrams,
      width: item.packageWidthCm,
      height: item.packageHeightCm,
      length: item.packageLengthCm,
      items: [
        {
          name: item.title,
          ware_key: String(item.itemId ?? item.id),
          payment: {
            value: 0,
          },
          weight: item.packageWeightGrams,
          amount: 1,
          cost: item.price,
          marking: null,
        },
      ],
      package_id: null,
    }))
  ) as unknown as CdekCreatingOrderBody["packages"];

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
    packages,
  };
}
