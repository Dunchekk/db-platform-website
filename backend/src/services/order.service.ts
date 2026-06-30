import { Order, Prisma } from "@prisma/client";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import {
  validateEmail,
  validatePhone,
  validateRequiredString,
} from "../helpers/validation";
import {
  CheckoutOrderInput,
  OrderWithCurrentPayment,
  PreparedOrder,
  ReqOrderItem,
} from "../types/checkout.types";

export const prepareOrderItems = async (
  items: ReqOrderItem[]
): Promise<PreparedOrder> => {
  if (items.length === 0) {
    throw ApiError.badRequest("Must be 1 item or more");
  }

  const itemIds = items.map((item) => item.itemId);

  const dbItems = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
  });

  const itemsMap = new Map(dbItems.map((item) => [item.id, item]));

  let subtotal = 0;
  let totalQuantity = 0;

  const orderItemsData = items.map((item) => {
    if (item.quantity <= 0) {
      throw ApiError.badRequest("Quantity must be greater than 0");
    }

    const dbItem = itemsMap.get(item.itemId);

    if (!dbItem) {
      throw ApiError.notFound(`There is no item with id ${item.itemId}`);
    }

    const total = dbItem.price * item.quantity;

    subtotal += total;
    totalQuantity += item.quantity;

    return {
      itemId: item.itemId,
      title: dbItem.name,
      price: dbItem.price,
      quantity: item.quantity,
      total,
    };
  });

  return {
    subtotal,
    orderItemsData,
    totalQuantity,
  };
};

export async function getOrCreateCheckoutOrder(
  {
    checkoutAttemptKey,
    subtotal,
    orderItemsData,
    deliveryPrice,
    firstName,
    lastName,
    patronymic,
    email,
    phone,
    telegram,
    office,
    city,
    comment,
  }: CheckoutOrderInput
): Promise<OrderWithCurrentPayment> {
  const existingOrder = await loadOrderWithCurrentPayment(checkoutAttemptKey);

  if (existingOrder) {
    return existingOrder;
  }

  let createdOrder: Order;

  try {
    createdOrder = await prisma.$transaction(async (tx): Promise<Order> => {
      const newOrder = await tx.order.create({
        data: {
          firstName: validateRequiredString(firstName, "firstName"),
          lastName: validateRequiredString(lastName, "lastName"),
          patronymic,
          email: validateEmail(email),
          phone: validatePhone(phone),
          telegram,
          deliveryPrice,
          comment,
          subtotal,
          checkoutAttemptKey,
          total: subtotal + deliveryPrice,

          deliveryOfficeUuid: office.uuid,
          deliveryCityCode: city.code,
          deliveryCityLabel: city.label,
          deliveryMethod: office.type === "PVZ" ? "CDEK_PVZ" : "CDEK_POSTAMAT",
          deliveryOfficeAddress: office.location.address_full,
          deliveryOfficeCode: office.code,
          deliveryOfficeType: office.type,
        },
      });

      await Promise.all(
        orderItemsData.map((item) =>
          tx.orderItem.create({
            data: {
              ...item,
              orderId: newOrder.id,
            },
          })
        )
      );

      return newOrder;
    });
  } catch (e) {
    if (isCheckoutAttemptKeyConflict(e)) {
      const conflictedOrder = await loadOrderWithCurrentPayment(checkoutAttemptKey);

      if (conflictedOrder) {
        return conflictedOrder;
      }
    }

    throw e;
  }

  const loadedOrder = await prisma.order.findUnique({
    where: {
      id: createdOrder.id,
    },
    include: {
      currentPayment: true,
    },
  });

  if (!loadedOrder) {
    throw new Error("Order was created but cannot be loaded");
  }

  return loadedOrder;
}

async function loadOrderWithCurrentPayment(checkoutAttemptKey: string) {
  return prisma.order.findUnique({
    where: { checkoutAttemptKey },
    include: { currentPayment: true },
  });
}

function isCheckoutAttemptKeyConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes("checkoutAttemptKey");
  }

  return target === "checkoutAttemptKey";
}
