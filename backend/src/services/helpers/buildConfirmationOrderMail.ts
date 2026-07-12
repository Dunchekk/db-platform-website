import {
  ConfirmationOrderMailOrder,
  ConfirmationOrderMailShipment,
} from "../../types/mail.types";

export function buildConfirmationOrderMail(
  order: ConfirmationOrderMailOrder,
  shipment: ConfirmationOrderMailShipment
) {
  const items = order.items.reduce((acc, item) => {
    return acc + `— ${item.title}, ${item.quantity}\n`;
  }, "");

  const text = [
    `Здравствуйте, ${order.firstName}!`,
    "",
    `Ваш заказ №${order.id} успешно оформлен.`,
    `Сумма заказа: ${order.total} ₽.`,
    "",
    "Содержимое заказа:",
    items,
    "",
    "Информация о доставке:",
    `Адрес доставки (постомат/ПВЗ): ${order.deliveryOfficeAddress}`,
    `Провайдер: ${shipment.provider}`,
    `Трек-номер для отслеживания: ${shipment.trackingNumber}`,
    `Url для отслеживания: ${
      shipment.trackingUrl
        ? shipment.trackingUrl
        : "https://www.cdek.ru/ru/tracking/"
    }`,
    "",
    "Если вы хотите что-то уточнить, или где-то есть ошибки, напиишите ответное письмо на эту же почту, или в телеграмм (отвечу быстрее): @umni0enivibly",
    "",
    "Спасибо за покупку <3",
    "",
    "С уважением,",
    "db",
  ].join("\n");

  return {
    subject: `Заказ №${order.id} оформлен`,
    text,
  };
}
