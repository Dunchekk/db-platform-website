export type ReqOrderBody = {
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
  phone: string;
  telegram?: string;
  deliveryPrice: number;
  comment?: string;
  subtotal: number;
  total: number;
  items: ReqOrderItem[];
};

export type ReqOrderItem = {
  itemId: number;
  quantity: number;
};
