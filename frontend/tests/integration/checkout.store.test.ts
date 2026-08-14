// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from "vitest";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";
import type { CdekOffice, CdekSuggestedCity } from "@/shared/types/cdek.types";
import type { CheckoutFormInputs } from "@/features/checkout/formData.store";

const initialForm: CheckoutFormInputs = {
  firstName: "",
  lastName: "",
  patronymic: "",
  email: "",
  phone: "",
  telegram: "",
  comment: "",
  deliveryPrice: null,
  personalDataConsentAccepted: false,
  checkoutAttemptKey: null,
  fingerprint: null,
  offerAccepted: false,
  city: null,
  office: null,
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
  phones: [],
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

describe("checkout store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCheckoutItems.setState({
      items: [],
    });
    useCheckoutFormInputs.setState({
      form: { ...initialForm },
      formResetKey: 0,
    });
  });

  test("добавляет новый товар в корзину", () => {
    useCheckoutItems.getState().addItem(1);

    expect(useCheckoutItems.getState().items).toEqual([
      {
        itemId: 1,
        quantity: 1,
      },
    ]);
  });

  test("увеличивает количество, если товар уже есть в корзине", () => {
    useCheckoutItems.getState().addItem(1);
    useCheckoutItems.getState().addItem(1);

    expect(useCheckoutItems.getState().items).toEqual([
      {
        itemId: 1,
        quantity: 2,
      },
    ]);
    expect(useCheckoutItems.getState().getAllQuantity()).toBe(2);
  });

  test("уменьшает количество и удаляет товар, если осталась одна штука", () => {
    useCheckoutItems.getState().addItem(1);
    useCheckoutItems.getState().addItem(1);

    useCheckoutItems.getState().decreaseItem(1);

    expect(useCheckoutItems.getState().items).toEqual([
      {
        itemId: 1,
        quantity: 1,
      },
    ]);

    useCheckoutItems.getState().decreaseItem(1);

    expect(useCheckoutItems.getState().items).toEqual([]);
  });

  test("удаляет из корзины товары, которых нет в списке доступных", () => {
    useCheckoutItems.getState().addItem(1);
    useCheckoutItems.getState().addItem(2);
    useCheckoutItems.getState().addItem(3);

    useCheckoutItems.getState().removeUnavailableItems([1, 3]);

    expect(useCheckoutItems.getState().items).toEqual([
      {
        itemId: 1,
        quantity: 1,
      },
      {
        itemId: 3,
        quantity: 1,
      },
    ]);
  });

  test("сбрасывает выбранную доставку при изменении корзины", () => {
    useCheckoutFormInputs.setState({
      form: {
        ...initialForm,
        city: testCity,
        office: testOffice,
        deliveryPrice: 300,
      },
      formResetKey: 0,
    });

    useCheckoutItems.getState().addItem(1);

    expect(useCheckoutFormInputs.getState().form).toMatchObject({
      city: testCity,
      office: null,
      deliveryPrice: null,
    });
    expect(useCheckoutFormInputs.getState().formResetKey).toBe(1);
  });
});
