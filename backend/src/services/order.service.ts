import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { PreparedOrder, ReqOrderItem } from "../types/checkout.types";

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
