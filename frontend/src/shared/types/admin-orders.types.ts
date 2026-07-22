export type AdminOrderSortBy = "createdAt" | "total";
export type AdminOrderSortDir = "asc" | "desc";

export type AdminOrdersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: AdminOrderSortBy;
  sortDir?: AdminOrderSortDir;
};

export type AdminOrderItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
};

export type AdminOrderPayment = {
  id: number;
  status: string;
  amount: number;
  currency: string;
  providerPaymentId: string | null;
  paidAt: string | null;
  canceledAt: string | null;
  createdAt: string;
};

export type AdminOrderShipment = {
  id: number;
  status: string;
  provider: string;
  providerShipmentId: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrder = {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  email: string;
  phone: string;
  telegram: string | null;
  deliveryMethod: string;
  deliveryPrice: number;
  deliveryCityLabel: string;
  deliveryOfficeAddress: string;
  comment: string | null;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  currentPayment: AdminOrderPayment | null;
  shipment: AdminOrderShipment | null;
};

export type AdminOrdersResponse = {
  items: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: AdminOrderSortBy;
  sortDir: AdminOrderSortDir;
  search: string | null;
};
