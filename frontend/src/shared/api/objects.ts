import { $authHost, $host } from ".";
import {
  DbObject,
  DbObjectImage,
  payloadDbObject,
} from "../types/object.types";
import { IMAGE_UPLOAD_URL, IMAGE_URL, ITEM_URL, ITEMS_URL } from "./endpoints";

export const getItems = async () => {
  const response = await $host.get(ITEMS_URL);

  return response;
};

export const createItem = async (item: payloadDbObject) => {
  // создать тип
  const response = await $authHost.post(ITEMS_URL, item);

  return response;
};

export const changeItem = async (item: DbObject) => {
  const response = await $authHost.put(ITEM_URL(item.id), item);

  return response;
};

export const deleteItem = async (id: number | string) => {
  const response = await $authHost.delete(ITEM_URL(id));

  return response;
};

export const uploadItemFile = async (id: number | string, file: File) => {
  // должен принимать файл
  const formData = new FormData();
  formData.append("image", file);
  const response = await $authHost.post(IMAGE_UPLOAD_URL(id), formData);

  return response;
};

export const deleteItemFile = async (
  itemId: number | string,
  imageId: number | string
) => {
  const response = await $authHost.delete(IMAGE_URL(itemId, imageId));

  return response;
};

export const changeItemFile = async (image: DbObjectImage) => {
  const response = await $authHost.patch(
    IMAGE_URL(image.itemId, image.id),
    image
  );

  return response;
};
