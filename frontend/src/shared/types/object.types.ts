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
  order: number;
  images: DbObjectImage[];
  points: DbObjectPoint[];
  info: DbObjectInfo[];
};

export type ObjectsState = {
  // для стора объектов
  objects: DbObject[];
  setObjects: (objects: DbObject[]) => void;
};
