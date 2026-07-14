import { $host } from ".";
import {
  CdekOffice,
  CdekPackageParams,
  CdekSuggestedCity,
} from "../types/cdek.types";
import { NormalizedDeliveryInfo } from "../types/checkout.types";
import {
  CDEK_GET_CITIES_URL,
  CDEK_GET_DELIVERY_PRICE_URL,
  CDEK_GET_OFFICES_URL,
} from "./endpoints";

export const getCities = async (
  query: string
): Promise<CdekSuggestedCity[]> => {
  const response = await $host.get(CDEK_GET_CITIES_URL + `?query=${query}`);
  return response;
};

export const getOffices = async (
  city_code: number,
  packageParams: CdekPackageParams
): Promise<CdekOffice[]> => {
  const params = new URLSearchParams({
    city_code: String(city_code),
    weight: String(packageParams.weight),
    length: String(packageParams.length),
    width: String(packageParams.width),
    height: String(packageParams.height),
  });

  const response = await $host.get(
    `${CDEK_GET_OFFICES_URL}?${params.toString()}`
  );
  return response;
};

export const getDeliveryPrice = async (
  city_code: number,
  weight: number
): Promise<NormalizedDeliveryInfo> => {
  const params = new URLSearchParams({
    city_code: String(city_code),
    weight: String(weight),
  });
  const response = await $host.get(
    `${CDEK_GET_DELIVERY_PRICE_URL}?${params.toString()}`
  );
  return response;
};
