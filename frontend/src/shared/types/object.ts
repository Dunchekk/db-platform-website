export type DbObjectDetailsEntry = {
  property: string;
  fill: string;
};

export type DbObject = {
  id: string;
  img: string;
  name: string;
  prise: string;
  choise: string[];
  images: string[];
  details: {
    properties: DbObjectDetailsEntry[];
    points: string[];
  };
};
