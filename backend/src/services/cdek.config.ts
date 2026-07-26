import { env } from "../config/env";

export const cdekConfig = {
  baseUrl: env.CDEK_BASE_URL,
  clientId: env.CDEK_CLIENT_ID,
  clientSecret: env.CDEK_CLIENT_SECRET,
  countryCode: env.CDEK_COUNTRY_CODE,
};

export const cdekOrderProperties = {
  weightMin: null, // Минимальный вес (в кг.), принимаемый в ПВЗ (> WeightMin)
  weightMax: "0", // Максимальный вес (в кг.), принимаемый в ПВЗ (<=WeightMax)
  fromCityCode: 44,
  tariffCode: 136,
  name: "Дубовицкий Иван Максимович",
  inn: "973302833571",
  phone: "+79645556042",
  // Код формы собственности по ОКФС — 16 («Частная собственность»). Для указанного в выписке российского ИП
  ownershipForm: 16,
  shipmentPoint: "MSK664",
};
