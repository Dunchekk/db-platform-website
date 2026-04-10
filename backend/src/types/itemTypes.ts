export type CreateItemBody = {
  name: string;
  price: number;
  order: number;
  points: string[];
  info: ItemInformation[];
  images: ItemImage[];
};

export type ItemInformation = {
  title: string;
  description: string;
};

export type ItemImage = {
  url: string;
  position: number;
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
