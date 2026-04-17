import type { Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { ReqOrderBody } from "../types/checkout.types";

class CheckoutController {
  async createOrder(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        patronymic,
        email,
        phone,
        telegram,
        // deliveryPrice,
        comment,
        // subtotal,
        // total,
        items,
      }: ReqOrderBody = req.body;

      if (items.length <= 0) {
        throw ApiError.badRequest("Must be 1 item or more");
      }

      const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            firstName,
            lastName,
            patronymic,
            email,
            phone,
            telegram,
            deliveryPrice: 0,
            comment,
            subtotal: 0,
            total: 0,
          },
        });

        // let orderSubTotal = 0;
        // let orderTotal = 0
        // let orderDelivPrice = 0

        const orderItemsData = await Promise.all(
          items.map(async (item) => {
            const innerItem = await tx.item.findUnique({
              where: { id: item.itemId },
            });

            if (innerItem === null) {
              throw ApiError.notFound("There is no item with such ID");
            }

            if (item.quantity <= 0) {
              throw ApiError.badRequest("Quantity must be greater than 0");
            }

            return {
              itemId: item.itemId,
              orderId: createdOrder.id,
              title: innerItem.name,
              price: innerItem.price,
              quantity: item.quantity,
              total: innerItem.price * item.quantity,
            };
          })
        );

        const orderSubTotal = orderItemsData.reduce(
          (sum, item) => sum + item.total,
          0
        );

        await Promise.all(
          orderItemsData.map((data) => tx.orderItem.create({ data }))
        );

        const updCreatedOrder = await tx.order.update({
          where: { id: createdOrder.id },
          data: { subtotal: orderSubTotal },
        });

        return updCreatedOrder;
      });

      res.json(order);

      // создать заказ (ордер)
      // создать все ордерАйтемы

      // позже: редиректнуть пользователя на страницу оплаты
      // позже: принять сообщение страницы оплаты об оплате
      // позже: обработать и записать данные о доставке

      // посчитать тотал прайс (?)
      // отправить подтверждение на имейл (?)
    } catch (e) {
      if (e instanceof ApiError) {
        res.json(e);
      }
      if (e instanceof Error) {
        console.log(e);
      }

      // сделать эрроры посильнее
    }
  }
}

export const checkoutController = new CheckoutController();
