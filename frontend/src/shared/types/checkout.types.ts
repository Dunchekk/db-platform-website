export type CheckoutBody = {
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
  phone: string;
  telegram?: string;
  comment?: string;
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
