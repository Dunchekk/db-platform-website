import { CdekOffice, CdekSuggestedCity } from "./cdek.types";

export type CheckoutBody = {
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
  phone: string;
  telegram?: string;
  comment?: string;
  deliveryPrice: number;
  subtotal: number;
  office: CdekOffice;
  city: CdekSuggestedCity;
  total: number;
  items: CheckoutItem[];
};

export type CheckoutItem = {
  itemId: number;
  quantity: number;
};

export type CheckoutItemsStore = {
  items: CheckoutItem[];
  addItem: (itemId: number) => void;
  decreaseItem: (itemId: number) => void;
  clearItems: () => void;
  getAllQuantity: () => number;
};

export type NormalizedDeliveryInfo = {
  delivery_sum: number;
  period_min: number;
  period_max: number;
  currency: string;
};

export type CreateOrderResponse = {
  orderId: number;
  paymentId: number;
  confirmationUrl: string;
};
