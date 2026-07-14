import { requiredEnv } from "../helpers/requiredEnv";

export const cdekConfig = {
  baseUrl: requiredEnv("CDEK_BASE_URL"),
  clientId: requiredEnv("CDEK_CLIENT_ID"),
  clientSecret: requiredEnv("CDEK_CLIENT_SECRET"),
  countryCode: requiredEnv("CDEK_COUNTRY_CODE"),
};

export const cdekOrderProperties = {
  weightMin: null, // Минимальный вес (в кг.), принимаемый в ПВЗ (> WeightMin)
  weightMax: "0", // Максимальный вес (в кг.), принимаемый в ПВЗ (<=WeightMax)
  fromCityCode: 44,
  tariffCode: 136,
  name: "Дубовицкий Иван Максимович",
  inn: "0000000000000000",
  phone: "24567820957",
  shipmentPoint: "",
};
