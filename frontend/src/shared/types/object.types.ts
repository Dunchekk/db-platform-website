export type DbObjectPoint = {
  id: number;
  itemId: number;
  point: string;
};

export type DbObjectInfo = {
  id: number;
  itemId: number;
  title: string;
  description: string;
};

export type DbObjectImage = {
  id: number;
  url: string;
  itemId: number;
  position: number;
};

export type DbObject = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  price: number;
  position: number;
  images: DbObjectImage[];
  points: DbObjectPoint[];
  info: DbObjectInfo[];
};

export type ObjectsState = {
  // для стора объектов
  objects: DbObject[];
  isObjectsReady: boolean;
  setObjects: (objects: DbObject[]) => void;
  setObjectsReady: (bool: boolean) => void;
};

// для создания объекта (пока не присвоено айди)

export type PayloadDbObject = {
  name: string;
  price: number;
  position: number;
  points: CreateItemPointPayload[];
  info: CreateItemInfoPayload[];
};

export type CreateItemPointPayload = {
  point: string;
};

export type CreateItemInfoPayload = {
  title: string;
  description: string;
};

// объект корзины
export type CartViewObject = DbObject & {
  quantity: number;
};
