import "dotenv/config";
import { URLSearchParams } from "node:url";
import {
  CdekCreatingOrderBody,
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
import { getCurrentCdekStatusCode } from "../helpers/getCurrentCdekStatusCode";
import { validatePhone } from "../helpers/validation";
import { Order, OrderItem } from "@prisma/client";

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
  base_weight: "350",
  from_city_code: 44,
  tarrif_code: 136,
  name: "Дубовицкий Иван Максимович",
  inn: "0000000000000000",
  phone: "24567820957",
  shipment_point: "",
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

export async function suggestCdekDeliveryPrice(
  to_city_code: number,
  order_weight: number = 600,
  from_city_code: number = cdekOrderProperties.from_city_code,
  tariff_code: number = cdekOrderProperties.tarrif_code
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

export async function CreatingCdekShipmentRegistrationBody(
  order: Order & { items: OrderItem[] }
): Promise<CdekCreatingOrderBody> {
  const packageItems = order.items.map((item) => ({
    name: item.title,
    ware_key: String(item.itemId ?? item.id),
    payment: {
      value: item.price,
    },
    weight: cdekOrderProperties.base_weight,
    amount: item.quantity,
    cost: item.price,
    marking: null,
  })) as unknown as CdekCreatingOrderBody["packages"][number]["items"];

  const body: CdekCreatingOrderBody = {
    type: 1,
    number: String(order.id),
    tariff_code: cdekOrderProperties.tarrif_code,
    comment: order.comment || undefined,
    delivery_point: order?.deliveryOfficeCode,
    shipment_point: cdekOrderProperties.shipment_point,
    seller: {
      name: cdekOrderProperties.name,
      inn: cdekOrderProperties.inn,
      phone: cdekOrderProperties.phone,
    },
    recipient: {
      name: [order.lastName, order.firstName, order.patronymic]
        .filter(Boolean)
        .join(" "),
      email: `${order?.email}`,
      phones: [{ number: `${validatePhone(order?.phone)}` }],
    },
    packages: [
      {
        number: String(order.id),
        weight: Number(cdekOrderProperties.base_weight) * packageItems.length,
        width: Number(cdekOrderProperties.width),
        height: Number(cdekOrderProperties.height),
        length: Number(cdekOrderProperties.length),
        items: packageItems,
        package_id: null,
      },
    ],
  };

  return body;
}
//-------------------------

export async function createCdekShipmentForPaidOrder(orderId: number) {
  // проверка на существующий shipment с отправкой у этого айди, повторный ниче не делает
  const oldShipment = await prisma.shipment.findFirst({
    where: {
      orderId,
    },
  });

  if (oldShipment && oldShipment.trackingNumber && oldShipment.orderId) {
    const cdekOldShipment = await fetchCdekShipment({
      trackingNumber: oldShipment.trackingNumber,
      orderId: oldShipment.orderId,
    });

    if (cdekOldShipment) {
      const status = getCurrentCdekStatusCode(cdekOldShipment);
      if (
        status !== "INVALID" &&
        status !== "NOT_DELIVERED" &&
        status !== "REMOVED"
      ) {
        return cdekOldShipment;
      }
    }
  }

  // собрать payload только из server-side данных заказа: ФИО, телефон, город/ПВЗ, OrderItem, вес, тариф, габариты, стоимость.
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  if (!order) throw new Error("Order not found");

  const body = await CreatingCdekShipmentRegistrationBody(order);

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

  // запрос инфо только что создавшегося заказа: проверяем статус и достаем трекинг
  const cdekShipmentInfo = await fetchCdekShipment({
    orderId,
  });

  const cdekShipmentStatus = getCurrentCdekStatusCode(cdekShipmentInfo);

  if (cdekShipmentStatus === "INVALID") {
    throw ApiError.badGateway(
      "CDEK shipment was created but returned INVALID status"
    );
  }

  const trackingNumber = cdekShipmentInfo.entity?.cdek_number
    ? String(cdekShipmentInfo.entity.cdek_number)
    : null;

  // После успешного ответа CDEK сохранить в Shipment минимум providerShipmentId, трек-номер, ссылку/идентификатор для последующего GET, и перевести Shipment.status в CREATED
  const shipment = oldShipment
    ? await prisma.shipment.update({
        where: {
          id: oldShipment.id,
        },
        data: {
          status: "CREATED",
          providerShipmentId: responseBody.entity.uuid,
          trackingNumber,
        },
      })
    : await prisma.shipment.create({
        data: {
          status: "CREATED",
          orderId: orderId,
          providerShipmentId: responseBody.entity.uuid,
          trackingNumber,
        },
      });

  // Order.status после этого логичнее переводить из PAID в FULFILLMENT_PENDING
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "FULFILLMENT_PENDING",
    },
  });

  return shipment;
}
