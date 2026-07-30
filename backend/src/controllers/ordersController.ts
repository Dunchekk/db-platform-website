import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import ApiError from "../error/ApiError";
import { parseIdParam } from "../helpers/parseIdParam";
import { createCdekShipmentForPaidOrder } from "../services/cdek.service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

type OrderSortBy = "createdAt" | "total";
type SortDir = "asc" | "desc";

class OrdersController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page =
        parsePositiveQueryInteger(req.query.page, "page") ?? DEFAULT_PAGE;
      const limit =
        parsePositiveQueryInteger(req.query.limit, "limit") ?? DEFAULT_LIMIT;
      const safeLimit = Math.min(limit, MAX_LIMIT);
      const search = parseStringQuery(req.query.search, "search")?.trim();
      const sortBy = parseSortBy(req.query.sortBy);
      const sortDir = parseSortDir(req.query.sortDir);

      const where = buildOrdersWhere(search);
      const orderBy: Prisma.OrderOrderByWithRelationInput = {
        [sortBy]: sortDir,
      };

      const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          orderBy,
          skip: (page - 1) * safeLimit,
          take: safeLimit,
          select: {
            id: true,
            status: true,
            firstName: true,
            lastName: true,
            patronymic: true,
            email: true,
            phone: true,
            telegram: true,
            deliveryMethod: true,
            deliveryPrice: true,
            deliveryCityLabel: true,
            deliveryOfficeAddress: true,
            comment: true,
            subtotal: true,
            total: true,
            createdAt: true,
            updatedAt: true,
            items: {
              orderBy: { id: "asc" },
              select: {
                id: true,
                title: true,
                price: true,
                quantity: true,
                total: true,
              },
            },
            currentPayment: {
              select: {
                id: true,
                status: true,
                amount: true,
                currency: true,
                providerPaymentId: true,
                paidAt: true,
                canceledAt: true,
                createdAt: true,
              },
            },
            shipments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                status: true,
                provider: true,
                providerShipmentId: true,
                trackingNumber: true,
                trackingUrl: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        }),
      ]);

      return res.json({
        items: orders.map(({ shipments, ...order }) => ({
          ...order,
          shipment: shipments[0] ?? null,
        })),
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        sortBy,
        sortDir,
        search: search || null,
      });
    } catch (error) {
      return next(error);
    }
  }

  async retryShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseIdParam(req.params.id);

      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          status: true,
          currentPayment: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      if (
        order.currentPayment?.status !== "SUCCEEDED" &&
        order.status !== "PAID" &&
        order.status !== "FULFILLMENT_PENDING"
      ) {
        throw ApiError.badRequest("Shipment retry requires a paid order");
      }

      const shipment = await createCdekShipmentForPaidOrder(order.id);

      return res.json(shipment);
    } catch (error) {
      return next(error);
    }
  }
}

function parsePositiveQueryInteger(
  value: unknown,
  fieldName: string
): number | null {
  if (value === undefined) {
    return null;
  }

  const rawValue = parseStringQuery(value, fieldName);

  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw ApiError.badRequest(`${fieldName} must be a positive integer`);
  }

  return parsed;
}

function parseStringQuery(value: unknown, fieldName: string): string | null {
  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    throw ApiError.badRequest(`${fieldName} must be a single value`);
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest(`${fieldName} must be a string`);
  }

  return value;
}

function parseSortBy(value: unknown): OrderSortBy {
  const sortBy = parseStringQuery(value, "sortBy") ?? "createdAt";

  if (sortBy !== "createdAt" && sortBy !== "total") {
    throw ApiError.badRequest("sortBy must be createdAt or total");
  }

  return sortBy;
}

function parseSortDir(value: unknown): SortDir {
  const sortDir = parseStringQuery(value, "sortDir") ?? "desc";

  if (sortDir !== "asc" && sortDir !== "desc") {
    throw ApiError.badRequest("sortDir must be asc or desc");
  }

  return sortDir;
}

function buildOrdersWhere(search: string | undefined): Prisma.OrderWhereInput {
  if (!search) {
    return {};
  }

  const searchNumber = Number(search);
  const or: Prisma.OrderWhereInput[] = [
    // массив условий. Заказ подходит, если совпало хотя бы одно поле.
    { firstName: { contains: search, mode: "insensitive" } }, // "insensitive" - поиск без учета регистра.
    { lastName: { contains: search, mode: "insensitive" } },
    { patronymic: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
    { telegram: { contains: search, mode: "insensitive" } },
    { deliveryCityLabel: { contains: search, mode: "insensitive" } },
    { deliveryOfficeAddress: { contains: search, mode: "insensitive" } },
    {
      items: {
        some: {
          title: { contains: search, mode: "insensitive" },
        },
      },
    },
    {
      currentPayment: {
        providerPaymentId: { contains: search, mode: "insensitive" },
      },
    },
    {
      shipments: {
        some: {
          OR: [
            { trackingNumber: { contains: search, mode: "insensitive" } },
            { providerShipmentId: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    },
  ];

  if (Number.isInteger(searchNumber)) {
    or.unshift({ id: searchNumber });
  }

  return { OR: or }; // возвращаем фильр для Prisma: найди заказы, где совпало любое из этих условий
}

export const ordersController = new OrdersController();
