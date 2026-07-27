import { expect, test, type Page } from "@playwright/test";
import type {
  CdekOffice,
  CdekSuggestedCity,
} from "../../src/shared/types/cdek.types";
import type { DbObject } from "../../src/shared/types/object.types";

const testItem: DbObject = {
  id: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  name: "E2E тестовый объект",
  price: 1200,
  position: 1,
  packageWeightGrams: 500,
  packageLengthCm: 20,
  packageWidthCm: 10,
  packageHeightCm: 5,
  images: [
    {
      id: 1,
      itemId: 1,
      position: 1,
      url: "/uploads/e2e-item.svg",
    },
  ],
  points: [
    {
      id: 1,
      itemId: 1,
      point: "тестовая характеристика",
    },
  ],
  info: [
    {
      id: 1,
      itemId: 1,
      title: "Размер",
      description: "20x10 см",
    },
  ],
};

const testCity: CdekSuggestedCity = {
  uuid: "city-uuid",
  code: 44,
  label: "Москва",
  countryCode: "RU",
};

const testOffice: CdekOffice = {
  code: "PVZ-1",
  uuid: "office-uuid",
  type: "PVZ",
  work_time: "10:00-20:00",
  phones: [
    {
      number: "+79991234567",
      additional: "",
    },
  ],
  work_time_list: [],
  location: {
    country_code: "RU",
    region_code: 77,
    region: "Москва",
    city_code: 44,
    city: "Москва",
    longitude: 37.62,
    latitude: 55.75,
    address: "Тестовый ПВЗ",
    address_full: "Москва, тестовый ПВЗ",
    city_uuid: "city-uuid",
  },
};

test("покупатель может оформить заказ до перехода на оплату", async ({
  page,
}) => {
  await mockApi(page); // до открытия страницы подменяем API
  // frontend будет думать, что backend отвечает,
  // но реально запросы перехватывает Playwright

  await page.goto("/");

  await expect(page.getByText(testItem.name)).toBeVisible();
  await page.getByText(testItem.name).click();

  await page.getByRole("button", { name: "+ в корзину" }).click();
  await page.getByRole("button", { name: "Открыть корзину" }).click();
  // в коде кнопки корзины есть ареа-лейбл с этим текстом

  await fillInputByFloatingLabel(page, "имя*", "Anna");
  await fillInputByFloatingLabel(page, "фамилия*", "Test");
  await fillInputByFloatingLabel(page, "почта*", "anna@example.com");
  await fillInputByFloatingLabel(page, "телефон*", "+79991234567");

  await fillInputByFloatingLabel(page, "город*", "Мо");
  await page.locator("li", { hasText: testCity.label }).click();

  await fillInputByFloatingLabel(page, "пункт получения*", "Тестовый");
  await page.locator("li", { hasText: testOffice.location.address }).click();

  await page.getByLabel(/Публичной оферты/).check();
  await page.getByLabel("Я очень крут*").check();

  const checkoutRequestPromise = page.waitForRequest((request) => {
    return (
      request.method() === "POST" && request.url().endsWith("/api/checkout")
    );
  });

  // ↑ начинаем ждать до клика. после клика запрос может улететь очень быстро
  // если начать ждать после клика, можно его пропустить

  await page.getByRole("button", { name: /оформить заказ/ }).click();

  // ↑ после клика срабатывает handleSubmit в CheckoutLayer.tsx
  // там frontend собирает payload
  // createOrder(payload)
  // POST /api/checkout -> Playwright этот запрос видит и сохраняет в checkoutRequest

  const checkoutRequest = await checkoutRequestPromise;
  const checkoutPayload = checkoutRequest.postDataJSON();

  expect(checkoutPayload).toMatchObject({
    firstName: "Anna",
    lastName: "Test",
    email: "anna@example.com",
    phone: "+79991234567",
    deliveryPrice: 300,
    subtotal: 1200,
    total: 1500,
    city: testCity,
    office: testOffice,
    items: [
      {
        itemId: testItem.id,
        quantity: 1,
      },
    ],
  });
  expect(checkoutPayload.checkoutAttemptKey).toEqual(expect.any(String));

  await expect(page).toHaveURL("http://localhost:8080/e2e-payment-confirmed");
});

async function mockApi(page: Page) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "text/plain",
      body: "Unauthorized",
    });
  });

  await page.route("**/api/items", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([testItem]),
    });
  });

  await page.route("**/api/cdek/cities**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([testCity]),
    });
  });

  await page.route("**/api/cdek/delivery-points**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([testOffice]),
    });
  });

  await page.route("**/api/cdek/delivery-price", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        delivery_sum: 300,
        period_min: 2,
        period_max: 4,
        currency: "RUB",
      }),
    });
  });

  await page.route("**/api/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        orderId: 10,
        paymentId: 20,
        confirmationUrl: "http://localhost:8080/e2e-payment-confirmed",
        alreadyPaid: false,
      }),
    });
  });

  await page.route("**/uploads/e2e-item.svg", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#ece7df"/><circle cx="160" cy="120" r="64" fill="#1e8a7a"/></svg>`,
    });
  });
}

async function fillInputByFloatingLabel(
  page: Page,
  labelText: string,
  value: string
) {
  const input = page
    .locator("label", {
      hasText: labelText,
    })
    .locator("xpath=..")
    .locator("input");

  await input.fill(value);
}
