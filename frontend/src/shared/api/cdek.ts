import { $host } from ".";
import { CdekOffice, CdekSuggestedCity } from "../types/cdek.types";
import { CDEK_GET_CITIES_URL, CDEK_GET_OFFICES_URL } from "./endpoints";

export const getCities = async (
  query: string
): Promise<CdekSuggestedCity[]> => {
  const response = await $host.get(CDEK_GET_CITIES_URL + `?query=${query}`);
  return response;
};

export const getOffices = async (city_code: number): Promise<CdekOffice[]> => {
  const response = await $host.get(
    CDEK_GET_OFFICES_URL + `?city_code=${city_code}`
  );
  return response;
};
