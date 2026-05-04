import "dotenv/config";
import { URLSearchParams } from "node:url";
import { CdekSuggestedCityDto, CdekTokenResponse } from "../types/cdek.types";
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

  const response = await fetch(`${cdekConfig.baseUrl}/oauth/token`, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw ApiError.unauthorized(`CDEK auth failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as CdekTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

export async function suggestCdekCities(query: string) {
  const token = await getCdekToken();

  const params = new URLSearchParams({
    name: query,
    country_code: cdekConfig.countryCode || "RU",
  });

  const response = await fetch(
    `${cdekConfig.baseUrl}/location/suggest/cities?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, `CDEK suggest cities failed: ${text}`);
  }

  return response.json() as Promise<CdekSuggestedCityDto[]>;
}
