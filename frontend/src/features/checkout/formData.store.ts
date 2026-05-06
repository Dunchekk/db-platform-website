// CheckoutBody
import { create } from "zustand";
import { CdekOffice, CdekSuggestedCity } from "@/shared/types/cdek.types";

export type CheckoutFormInputs = {
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  phone: string;
  telegram: string;
  comment: string;
  deliveryPrice: number;
  subtotal: number;
  total: number;
  coolness: boolean;
  agreement: boolean;
  city: CdekSuggestedCity | null;
  office: CdekOffice | null;
};

export type CheckoutFormStore = {
  form: CheckoutFormInputs;
  formResetKey: number;
  updateFormResetKey: () => void;
  setField: <K extends keyof CheckoutFormInputs>(
    field: K,
    value: CheckoutFormInputs[K]
  ) => void;
  resetForm: () => void;
  setCity: (city: CdekSuggestedCity | null) => void;
  setOffice: (office: CdekOffice | null) => void;
  setPrices: (
    prices: Pick<CheckoutFormInputs, "deliveryPrice" | "subtotal" | "total">
  ) => void;
};

export const useCheckoutFormInputs = create<CheckoutFormStore>((set) => ({
  form: {
    firstName: "",
    lastName: "",
    patronymic: "",
    email: "",
    phone: "",
    telegram: "",
    comment: "",
    deliveryPrice: 0,
    subtotal: 0,
    total: 0,
    coolness: false,
    agreement: false,
    city: null,
    office: null,
  },
  formResetKey: 0,
  updateFormResetKey: () => {
    set((state) => ({
      formResetKey: state.formResetKey + 1,
    }));
  },
  setField: (field, value) => {
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    }));
  },
  resetForm: () => {
    set({
      form: {
        firstName: "",
        lastName: "",
        patronymic: "",
        email: "",
        phone: "",
        telegram: "",
        comment: "",
        deliveryPrice: 0,
        subtotal: 0,
        total: 0,
        coolness: false,
        agreement: false,
        city: null,
        office: null,
      },
    });
  },

  setCity: (city) =>
    set((state) => ({
      form: {
        ...state.form,
        city,
      },
    })),

  setOffice: (office) => {
    set((state) => ({
      form: {
        ...state.form,
        office,
      },
    }));
  },

  setPrices: (prices) => {
    set((state) => ({
      form: {
        ...state.form,
        deliveryPrice: prices.deliveryPrice,
        subtotal: prices.subtotal,
        total: prices.total,
      },
    }));
  },
}));
