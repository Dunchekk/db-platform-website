import { Order, Payment } from "@prisma/client";
import { CdekOfficeFromFront, CdekSuggestedCityFromFront } from "./cdek.types";

export type ReqOrderBody = {
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
  phone: string;
  telegram?: string;
  deliveryPrice: number;
  comment?: string;
  checkoutAttemptKey: string;
  subtotal: number;
  total: number;
  items: ReqOrderItem[];
  office: CdekOfficeFromFront;
  city: CdekSuggestedCityFromFront;
};

export type PreparedOrderItem = {
  itemId: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
};

export type PreparedOrder = {
  subtotal: number;
  orderItemsData: PreparedOrderItem[];
  totalQuantity: number;
};

export type ReqOrderItem = {
  itemId: number;
  quantity: number;
};

export type OrderWithCurrentPayment = Order & {
  currentPayment: Payment | null;
};
