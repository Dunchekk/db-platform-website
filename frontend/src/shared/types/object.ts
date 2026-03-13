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
    "always-shown": DbObjectDetailsEntry[];
    "all-shown": DbObjectDetailsEntry[];
  };
};

