import ApiError from "../error/ApiError";
import {
  CdekCreatingOrderBody,
  CdekEntityResponse,
  CdekTokenResponse,
  CdekSuggestedCityDto,
  CdekSuggestedOfficesDto,
  CdekSuggestDeliveryPriceBodySchema,
  DeliveryCalculationResponse,
  cdekShipmentResponce,
} from "../types/cdek.types";
import { cdekConfig, cdekOrderProperties } from "./cdek.config";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function fetchCdek(path: string, init: RequestInit) {
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
    weight_max: cdekOrderProperties.weightMax,
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

export async function suggestCdekDeliveryPrice(
  to_city_code: number,
  order_weight: number = 600,
  from_city_code: number = cdekOrderProperties.fromCityCode,
  tariff_code: number = cdekOrderProperties.tariffCode
) {
  const token = await getCdekToken();

  if (!to_city_code) {
    throw ApiError.badRequest("Query must contain to-city cdek code");
  } else if (!from_city_code) {
    throw ApiError.badRequest("Query must contain from-city cdek code");
  } else if (!order_weight) {
    throw ApiError.badRequest("Query must contain order weight");
  } else if (!tariff_code) {
    throw ApiError.badRequest("Query must contain tarrif code");
  }

  const body: CdekSuggestDeliveryPriceBodySchema = {
    type: 1,
    currency: 1,
    lang: "rus",
    tariff_code: tariff_code,
    from_location: {
      code: from_city_code,
    },
    to_location: {
      code: to_city_code,
    },
    packages: [
      {
        weight: order_weight,
      },
    ],
  };

  const response = await fetchCdek(`/calculator/tariff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<DeliveryCalculationResponse>;
}

//-------------------------

export async function fetchCdekShipment(params: {
  trackingNumber?: string | null;
  orderId?: number | null;
}) {
  const token = await getCdekToken();

  const searchParams = new URLSearchParams();

  if (params.trackingNumber) {
    searchParams.set("cdek_number", params.trackingNumber);
  }

  if (params.orderId) {
    searchParams.set("im_number", String(params.orderId));
  }

  if (!searchParams.size) {
    throw ApiError.badRequest(
      "CDEK shipment lookup requires trackingNumber or orderId"
    );
  }

  const response = await fetchCdek(`/orders?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.json() as Promise<cdekShipmentResponce>;
}

export async function createCdekOrder(body: CdekCreatingOrderBody) {
  const token = await getCdekToken();

  const response = await fetchCdek(`/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<CdekEntityResponse>;
}
