import { $host } from ".";
import { CdekSuggestedCity } from "../types/cdek.types";
import { CDEK_GET_CITIES_URL } from "./endpoints";

export const getCities = async (
  query: string
): Promise<CdekSuggestedCity[]> => {
  const response = await $host.get(CDEK_GET_CITIES_URL + `?query=${query}`);
  return response;
};
