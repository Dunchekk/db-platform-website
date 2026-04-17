export type CreateItemBody = {
  name: string;
  price: number;
  position: number;
  points: ItemPoint[];
  info: ItemInformation[];
};

export type ItemInformation = {
  title: string;
  description: string;
};

export type ItemImage = {
  url: string;
  position: number;
};

export type ItemPoint = {
  point: string;
};
