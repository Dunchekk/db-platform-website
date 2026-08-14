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
  personalDataConsentAccepted: boolean;
  fingerprint: string | null;
  checkoutAttemptKey: string | null;
  offerAccepted: boolean;
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
  resetDeliverySelection: () => void;
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
    deliveryPrice: null,
    personalDataConsentAccepted: false,
    offerAccepted: false,
    city: null,
    checkoutAttemptKey: null,
    fingerprint: null,
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
  resetDeliverySelection: () => {
    set((state) => ({
      formResetKey: state.formResetKey + 1,
      form: {
        ...state.form,
        office: null,
        deliveryPrice: null,
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
        personalDataConsentAccepted: false,
        checkoutAttemptKey: null,
        fingerprint: null,
        offerAccepted: false,
        city: null,
        office: null,
      },
    });
  },
}));
