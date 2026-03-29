import type { DbObject } from "@/shared/types/object";

import objectsRaw from "@/mocks/objects.json";

import bagImg from "@/assets/images/bg-items/bag.png";
import bagInsideFrontFullImg from "@/assets/images/bg-items/bag-inside-images/front-full.png";
import bagInsideFrontFullCondensedImg from "@/assets/images/bg-items/bag-inside-images/front-full-condensed.png";
import bagInsideFrontUntighthImg from "@/assets/images/bg-items/bag-inside-images/front-untighth.png";
import bagInsideSide1Img from "@/assets/images/bg-items/bag-inside-images/side1.png";
import beltImg from "@/assets/images/bg-items/belt.png";
import glovesImg from "@/assets/images/bg-items/gloves.png";
import pasportImg from "@/assets/images/bg-items/pasport.png";
import walletImg from "@/assets/images/bg-items/wallet.png";

const imagesByLegacyPath: Record<string, string> = {
  "/bg-items/bag.png": bagImg,
  "/bg-items/bag-inside-images/front-full.png": bagInsideFrontFullImg,
  "/bg-items/bag-inside-images/front-full-condensed.png":
    bagInsideFrontFullCondensedImg,
  "/bg-items/bag-inside-images/front-untighth.png": bagInsideFrontUntighthImg,
  "/bg-items/bag-inside-images/side1.png": bagInsideSide1Img,
  "/bg-items/belt.png": beltImg,
  "/bg-items/gloves.png": glovesImg,
  "/bg-items/pasport.png": pasportImg,
  "/bg-items/wallet.png": walletImg,
};

function replaceLegacyImagePath(path: string): string {
  return imagesByLegacyPath[path] ?? path;
}

export const objectsMock: DbObject[] = (objectsRaw as DbObject[]).map(
  (object) => ({
    ...object,
    img: replaceLegacyImagePath(object.img),
    images: Array.isArray(object.images)
      ? object.images.map(replaceLegacyImagePath)
      : [],
  })
);

export default objectsMock;
