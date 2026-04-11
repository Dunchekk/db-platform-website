export type CreateItemBody = {
  name: string;
  price: number;
  order: number;
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

// {
//   "name": "",
//   "price": 0,
//   "order": 0,
//   "points": ["", "", ""],

//   "info": [
//     {
//       "title": ""
//       "description": ""
//     },
//     {
//       "title": ""
//       "description": ""
//     }
//   ],

//   "images": [
//     {
//       "url": ""
//       "position": 0
//     },
//     {
//       "url": ""
//       "position": 0
//     }
//   ]
// }
