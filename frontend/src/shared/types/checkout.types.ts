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
  checkoutAttemptKey: string | null;
};

export type CheckoutItem = {
  itemId: number;
  quantity: number;
};

export type DeliveryPricePreviewBody = {
  city_code: number;
  items: CheckoutItem[];
};

export type CheckoutItemsStore = {
  items: CheckoutItem[];
  addItem: (itemId: number) => void;
  decreaseItem: (itemId: number) => void;
  removeUnavailableItems: (availableItemIds: number[]) => void;
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
  confirmationUrl: string | null;
  alreadyPaid: boolean;
};

export type CheckPaymentStatusResponse = {
  orderId: number;
  paymentId: number;
  orderStatus: string;
  paymentStatus: string;
  isPaid: boolean;
};
