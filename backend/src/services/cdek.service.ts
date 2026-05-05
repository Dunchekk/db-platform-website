import "dotenv/config";
import { URLSearchParams } from "node:url";
import {
  CdekSuggestedCityDto,
  CdekSuggestedOfficesDto,
  CdekTokenResponse,
} from "../types/cdek.types";
import ApiError from "../error/ApiError";
import { requiredEnv } from "../helpers/requiredEnv";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export const cdekConfig = {
  baseUrl: requiredEnv("CDEK_BASE_URL"),
  clientId: requiredEnv("CDEK_CLIENT_ID"),
  clientSecret: requiredEnv("CDEK_CLIENT_SECRET"),
  countryCode: requiredEnv("CDEK_COUNTRY_CODE"),
};

export const cdekOrderProperties = {
  weight_min: null, // Минимальный вес (в кг.), принимаемый в ПВЗ (> WeightMin)
  weight_max: "0", // Максимальный вес (в кг.), принимаемый в ПВЗ (<=WeightMax)
  length: "40", // величина посылок
  width: "30",
  height: "8",
};

async function fetchCdek(path: string, init: RequestInit) {
  try {
    const response = await fetch(`${cdekConfig.baseUrl}${path}`, init);

    if (!response.ok) {
      const text = await response.text();

      if (response.status === 401 || response.status === 403) {
        throw ApiError.badGateway(
          `CDEK rejected credentials: ${response.status} ${text}`
        );
      }

      if (response.status === 429) {
        throw ApiError.serviceUnavailable(`CDEK rate limited request: ${text}`);
      }

      throw ApiError.badGateway(
        `CDEK request failed: ${response.status} ${text}`
      );
    }

    return response;
  } catch (e) {
    if (e instanceof ApiError) throw e;

    if (e instanceof Error) {
      throw ApiError.serviceUnavailable(`CDEK is unavailable: ${e.message}`);
    }

    throw ApiError.serviceUnavailable("CDEK is unavailable");
  }
}

export async function getCdekToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: cdekConfig.clientId,
    client_secret: cdekConfig.clientSecret,
  });

  const response = await fetchCdek(`/oauth/token`, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = (await response.json()) as CdekTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  // console.log(cachedToken);
  return cachedToken;
}

export async function suggestCdekCities(query: string) {
  const token = await getCdekToken();

  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    throw ApiError.badRequest("City query must contain at least 2 characters");
  }

  const params = new URLSearchParams({
    name: normalizedQuery,
    country_code: cdekConfig.countryCode,
  });

  const response = await fetchCdek(`/location/suggest/cities?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.json() as Promise<CdekSuggestedCityDto[]>;
}

export async function suggestCdekOffices(city_code: number) {
  const token = await getCdekToken();

  if (!city_code) {
    throw ApiError.badRequest("City query must contain city cdek code");
  }

  const params = new URLSearchParams({
    city_code: String(city_code),
    type: "ALL",
    country_code: cdekConfig.countryCode,
    weight_max: cdekOrderProperties.weight_max,
    length: cdekOrderProperties.length,
    width: cdekOrderProperties.width,
    height: cdekOrderProperties.height,
    lang: "rus",
    is_handout: "1",
  });

  const response = await fetchCdek(`/deliverypoints?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.json() as Promise<CdekSuggestedOfficesDto[]>;
}
