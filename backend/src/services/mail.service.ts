import "dotenv/config";
import nodemailer from "nodemailer";
import { prisma } from "../db";
import { buildConfirmationOrderMail } from "./helpers/buildConfirmationOrderMail";

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

  const { subject, text } = buildConfirmationOrderMail(order, shipment);

  const answer = await transporter.sendMail({
    from: `"db" <${process.env.MAIL_USER}>`,
    to: order.email,
    subject,
    text,
  });

  if (answer.rejected.length > 0) {
    throw new Error("Mail transfer was rejected");
  }
}
