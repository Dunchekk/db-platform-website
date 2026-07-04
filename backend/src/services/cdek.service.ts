import "dotenv/config";
import { URLSearchParams } from "node:url";
import {
  CdekEntityResponse,
  cdekShipmentResponce,
  CdekSuggestDeliveryPriceBodySchema,
  CdekSuggestedCityDto,
  CdekSuggestedOfficesDto,
  CdekTokenResponse,
  DeliveryCalculationResponse,
} from "../types/cdek.types";
import ApiError from "../error/ApiError";
import { requiredEnv } from "../helpers/requiredEnv";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { buildCdekShipmentRegistrationBody } from "./helpers/buildCdekShipmentRegistrationBody";
import { restoreShipmentFromCdekIfExists } from "./helpers/restoreShipmentFromCdekIfExists";
import { waitForCdekShipment } from "./helpers/waitForCdekShipment";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export const cdekConfig = {
  baseUrl: requiredEnv("CDEK_BASE_URL"),
  clientId: requiredEnv("CDEK_CLIENT_ID"),
  clientSecret: requiredEnv("CDEK_CLIENT_SECRET"),
  countryCode: requiredEnv("CDEK_COUNTRY_CODE"),
};

export const cdekOrderProperties = {
  weightMin: null, // Минимальный вес (в кг.), принимаемый в ПВЗ (> WeightMin)
  weightMax: "0", // Максимальный вес (в кг.), принимаемый в ПВЗ (<=WeightMax)
  length: "40", // величина посылок
  width: "30",
  height: "8",
  baseWeight: "350",
  fromCityCode: 44,
  tariffCode: 136,
  name: "Дубовицкий Иван Максимович",
  inn: "0000000000000000",
  phone: "24567820957",
  shipmentPoint: "",
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

//-------------------------

export async function createCdekShipmentForPaidOrder(orderId: number) {
  // смотрим есть ли запись достаки у этого заказа (одна запись на 1 заказ)
  let canCreateRemoteShipment = false;
  let shipment = await prisma.shipment.findUnique({
    where: {
      orderId,
    },
  });

  if (!shipment) {
    try {
      shipment = await prisma.shipment.create({
        data: {
          orderId,
          status: "PENDING",
        },
      });
      canCreateRemoteShipment = true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
        // Если два потока одновременно пытаются создать одну и ту же Shipment,
        // один create пройдет, второй упадет с Prisma P2002. Не валим процесс,
        // дочитываем уже созданную запись
      ) {
        shipment = await prisma.shipment.findUnique({
          where: {
            orderId,
          },
        });
      } else {
        throw e;
      }
    }
  }

  if (!shipment) {
    throw ApiError.internal("Failed to acquire local shipment lock");
  }

  // если у найденной записи все ок по статусам, есть айди, не можем делать новую регистрацию, то возвращаем ее
  if (
    shipment.status === "CREATED" ||
    shipment.status === "IN_TRANSIT" ||
    shipment.status === "READY_FOR_PICKUP" ||
    shipment.status === "DELIVERED"
  ) {
    return shipment;
  }

  if (shipment.status === "PENDING" && shipment.providerShipmentId) {
    return shipment;
  }

  if (shipment.status === "PENDING" && !canCreateRemoteShipment) {
    return shipment;
  }

  // если у найденной записи все упало то будем с ней работать, и перепишем ее на рабочую
  if (shipment.status === "FAILED" || shipment.status === "CANCELED") {
    // проверим еще в сдеке -- дейсствительно ли все упало. если на ремоуте все ок то возрождаем старую запись
    const restoredShipment = await restoreShipmentFromCdekIfExists({
      orderId,
      fetchShipment: fetchCdekShipment,
    });

    if (restoredShipment) {
      return restoredShipment;
    }

    const claimedShipment = await prisma.shipment.updateMany({
      where: {
        id: shipment.id,
        status: shipment.status,
      },
      data: {
        status: "PENDING",
        providerShipmentId: null,
        trackingNumber: null,
        trackingUrl: null,
      },
    });

    // ↑ Два разных процесса (или запроса от пользователя) одновременно пытаются
    // обработать один и тот же заказ, у которого статус FAILED или CANCELED.
    // Если бы они оба просто прочитали статус, увидели, что он «плохой»,
    // и пошли создавать отправку в СДЭК, то для одного заказа создалось
    // бы два дубликата в СДЭКе.

    if (!claimedShipment.count) {
      // если count === 1, значит именно этот поток успел перевести запись из FAILED/CANCELED в PENDING и может идти дальше в CDEK
      return prisma.shipment.findUnique({
        where: {
          orderId,
        },
      });
    }
  }

  // собрать payload только из server-side данных заказа:
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  if (!order) throw new Error("Order not found");

  const body = buildCdekShipmentRegistrationBody(order, cdekOrderProperties);

  try {
    // вызов сдек
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

    const responseBody = (await response.json()) as CdekEntityResponse;

    // проверка статуса (последнего во всех статусах)
    const lastRequest = responseBody.requests[responseBody.requests.length - 1];

    if (!responseBody.entity?.uuid || lastRequest?.state === "INVALID") {
      const cdekError = lastRequest?.errors
        ?.map((item) => item.message)
        .join("; ");
      throw ApiError.badGateway(
        `CDEK shipment creation failed${cdekError ? `: ${cdekError}` : ""}`
      );
    }

    await prisma.shipment.update({
      where: {
        orderId,
      },
      data: {
        providerShipmentId: responseBody.entity.uuid,
      },
    });

    return waitForCdekShipment({
      orderId,
      fetchShipment: fetchCdekShipment,
    });
  } catch (e) {
    await prisma.shipment.update({
      where: {
        orderId,
      },
      data: {
        status: "FAILED",
      },
    });

    throw e;
  }
} // доделать хелперы и рефактор.
