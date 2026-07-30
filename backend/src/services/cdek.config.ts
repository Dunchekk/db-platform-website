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
  fromCityCode: parseRequiredIntegerEnv("CDEK_FROM_CITY_CODE"),
  tariffCode: parseRequiredIntegerEnv("CDEK_TARIFF_CODE"),
  name: env.CDEK_SELLER_NAME,
  inn: env.CDEK_SELLER_INN,
  phone: env.CDEK_SELLER_PHONE,
  // Код формы собственности по ОКФС.
  ownershipForm: parseRequiredIntegerEnv("CDEK_SELLER_OWNERSHIP_FORM"),
  shipmentPoint: env.CDEK_SHIPMENT_POINT,
};

function parseRequiredIntegerEnv(name: keyof typeof env) {
  const value = Number(env[name]);

  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }

  return value;
}
