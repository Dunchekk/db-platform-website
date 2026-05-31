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
  deliveryPrice: number | null;
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
        coolness: false,
        agreement: false,
        city: null,
        office: null,
      },
    });
  },
}));
