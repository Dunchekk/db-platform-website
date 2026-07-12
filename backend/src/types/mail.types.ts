export type ConfirmationOrderMailOrderItem = {
  title: string;
  quantity: number;
};

export type ConfirmationOrderMailOrder = {
  id: number;
  firstName: string;
  total: number;
  deliveryOfficeAddress: string;
  items: ConfirmationOrderMailOrderItem[];
};

export type ConfirmationOrderMailShipment = {
  provider: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
};
