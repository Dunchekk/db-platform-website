import nodemailer from "nodemailer";
import { prisma } from "../db";

// Nodemailer + SMTP обычного ящика Яндекс 360

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
  },
});

export async function sendConfirmationOrderMail(orderId: number) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  const shipment = await prisma.shipment.findUnique({
    where: {
      orderId: orderId,
    },
  });

  if (!order) {
    throw new Error("Can not find order for sending email");
  }

  if (order.items.length < 1) {
    throw new Error("Order does not contains any items");
  }

  if (!shipment) {
    throw new Error("Can not find shipment for sending email");
  }

  if (!order.email) {
    throw new Error("Order do not have any email adress");
  }

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
    `Url для отслеживания: ${shipment.trackingUrl ? shipment.trackingUrl : "https://www.cdek.ru/ru/tracking/"}`,
    "",
    "Если вы хотите что-то уточнить, или где-то есть ошибки, напиишите ответное письмо на эту же почту, или в телеграмм (отвечу быстрее): @umni0enivibly",
    "",
    "Спасибо за покупку <3",
    "",
    "С уважением,",
    "db",
  ].join("\n");

  await transporter.sendMail({
    from: `"db" <${process.env.MAIL_USER}>`,
    to: order.email,
    subject: `Заказ №${order.id} оформлен`,
    text,
  });
}
