import nodemailer from "nodemailer";
import { prisma } from "../db";
import { logEvents, logger } from "../lib/logger";
import { buildConfirmationOrderMail } from "./helpers/buildConfirmationOrderMail";
import { env } from "../config/env";

// Nodemailer + SMTP обычного ящика Яндекс 360
const SMTP_TIMEOUT_MS = 15_000;

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_APP_PASSWORD,
  },
});

export async function sendConfirmationOrderMail(orderId: number) {
  try {
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

    logger.info(logEvents.mailSendStarted, {
      orderId,
      shipmentId: shipment.id,
    });

    const answer = await transporter.sendMail({
      from: `"db" <${env.MAIL_USER}>`,
      to: order.email,
      subject,
      text,
    });

    if (answer.rejected.length > 0) {
      throw new Error("Mail transfer was rejected");
    }

    logger.info(logEvents.mailSendSucceeded, {
      orderId,
      shipmentId: shipment.id,
      messageId: answer.messageId,
      acceptedCount: answer.accepted.length,
      rejectedCount: answer.rejected.length,
    });
  } catch (e) {
    logger.error(logEvents.mailSendFailed, {
      orderId,
      err: e,
    });
    throw e;
  }
}
