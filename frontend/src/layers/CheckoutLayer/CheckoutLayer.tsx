import React, { useEffect, useState } from "react";
import cls from "@/layers/CheckoutLayer/CheckoutLayer.module.css";
import { CartViewObject, DbObject } from "@/shared/types/object.types";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useObjects } from "@/features/objects/objects.store";
import {
  CheckoutBody,
  CheckoutItem,
  // CreateOrderResponse,
} from "@/shared/types/checkout.types";
import O_CheckoutCartSummary from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary";
import O_CheckoutCustomerFields from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields";
import O_CheckoutDeliveryFields from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields";
import { checkPaymentStatus, createOrder } from "@/shared/api/checkout";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";
import { useLocation } from "react-router";
import type { CdekPackageParams } from "@/shared/types/cdek.types";

const PAYMENT_STATUS_POLL_ATTEMPTS = 5;
const PAYMENT_STATUS_POLL_DELAY = 1500;

const generateCheckoutAttemptKey = () => {
  const browserCrypto = globalThis.crypto;

  if (browserCrypto && typeof browserCrypto.randomUUID === "function") {
    return browserCrypto.randomUUID();
  }

  if (browserCrypto && typeof browserCrypto.getRandomValues === "function") {
    const bytes = browserCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) =>
      (byte + 0x100).toString(16).slice(1)
    );

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return `checkout-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const CheckoutLayer = () => {
  const { pathname, search } = useLocation();
  const allObjects: DbObject[] = useObjects((state) => state.objects);
  const cartItems: CheckoutItem[] = useCheckoutItems((state) => state.items);
  const deliveryPrice = useCheckoutFormInputs(
    (state) => state.form.deliveryPrice
  );

  const clearItems = useCheckoutItems((state) => state.clearItems);

  const cartObjects: CartViewObject[] = allObjects
    .filter((object) => cartItems.some((item) => item.itemId === object.id))
    .map((dbobject) => {
      const cartItem = cartItems.find((item) => item.itemId === dbobject.id);
      return {
        ...dbobject,
        quantity: cartItem.quantity ?? 0,
      };
    });

  const validCartItems: CheckoutItem[] = cartObjects.map((object) => ({
    itemId: object.id,
    quantity: object.quantity,
  }));

  // toast ↓
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastType, setToastType] = useState<"error" | "success" | "default">(
    "default"
  );
  const showToast = (
    message: string,
    type: "error" | "success" | "default"
  ) => {
    setToast(message);
    setToastType(type);
  };
  // toast ↑

  const form = useCheckoutFormInputs((state) => state.form);
  const formResetKey = useCheckoutFormInputs((state) => state.formResetKey);
  // const resetForm = useCheckoutFormInputs((state) => state.resetForm);
  // const updateFormResetKey = useCheckoutFormInputs(
  // (state) => state.updateFormResetKey
  // );
  const setField = useCheckoutFormInputs((state) => state.setField);

  const isCartEmpty = validCartItems.length === 0;

  const subtotal = cartObjects.reduce((sum, object) => {
    return sum + object.price * object.quantity;
  }, 0);

  const cartPackageParams = cartObjects.reduce<CdekPackageParams>(
    (params, object) => {
      if (object.quantity <= 0) {
        return params;
      }

      return {
        weight: params.weight + object.packageWeightGrams * object.quantity,
        length: Math.max(params.length, object.packageLengthCm),
        width: Math.max(params.width, object.packageWidthCm),
        height: Math.max(params.height, object.packageHeightCm),
      };
    },
    { weight: 0, length: 0, width: 0, height: 0 }
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const paymentReturn = searchParams.get("paymentReturn");
    const orderId = Number(searchParams.get("orderId"));
    const paymentId = Number(searchParams.get("paymentId"));

    if (
      paymentReturn !== "1" ||
      !Number.isInteger(orderId) ||
      !Number.isInteger(paymentId)
    ) {
      return;
    }

    let isCancelled = false;

    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const syncPaymentStatus = async () => {
      for (let attempt = 0; attempt < PAYMENT_STATUS_POLL_ATTEMPTS; attempt++) {
        const response = await checkPaymentStatus(orderId, paymentId);

        if (isCancelled) {
          return;
        }

        if (response.isPaid) {
          clearItems();
          showToast("Заказ оплачен, проверьте свою почту", "success");
          return;
        }

        if (attempt < PAYMENT_STATUS_POLL_ATTEMPTS - 1) {
          await wait(PAYMENT_STATUS_POLL_DELAY);
        }
      }
    };

    syncPaymentStatus().catch((e) => {
      if (isCancelled) {
        return;
      }

      showToast(
        "Не удалось подтвердить оплату. Проверьте свою почту, и, если что, напишите мне",
        "error"
      );
      console.error("не удалось подтвердить оплату:", e);
    });

    return () => {
      isCancelled = true;
    };
  }, [clearItems, pathname, search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      showToast("Оформляем заказ!", "success");
      return;
    }

    if (isCartEmpty) {
      showToast("добавьте что-нибудь в корзину", "error");
      return;
    } else if (!form.agreement) {
      showToast(
        "необходимо согласие с публичной офертой и политикой обработки персональных данных",
        "error"
      );
      return;
    } else if (!form.firstName.trim()) {
      showToast("пожалуйста, укажите ваше имя", "error");
      return;
    } else if (!form.lastName.trim()) {
      showToast("пожалуйста, укажите вашу фамилию", "error");
      return;
    } else if (!form.email.trim()) {
      showToast("пожалуйста, укажите ваш email", "error");
      return;
    } else if (!form.phone.trim()) {
      showToast("пожалуйста, укажите ваш номер телефона", "error");
      return;
    } else if (typeof form.deliveryPrice !== "number") {
      showToast("не удалось загрузить стоимость доставки", "error");
      return;
    } else if (!subtotal) {
      showToast("не удалось загрузить сумму заказа", "error");
      return;
    } else if (!form.city) {
      showToast("пожалуйста, укажите город назначения для доставки", "error");
      return;
    } else if (!form.office) {
      showToast("пожалуйста, укажите пункт назначения для доставки", "error");
      return;
    }

    let attemptKey: string;

    const newFingerPrint = JSON.stringify({
      items: [...validCartItems].sort((a, b) => a.itemId - b.itemId),
      cityCode: form.city?.code ?? null,
      officeCode: form.office?.code ?? null,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      patronymic: form.patronymic.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      telegram: form.telegram.trim(),
      comment: form.comment.trim(),
    });

    if (form.checkoutAttemptKey && form.fingerprint === newFingerPrint) {
      attemptKey = form.checkoutAttemptKey;
    } else {
      attemptKey = generateCheckoutAttemptKey();
      setField("checkoutAttemptKey", attemptKey);
      setField("fingerprint", newFingerPrint);
    }

    const payload: CheckoutBody = {
      firstName: String(form.firstName ?? ""),
      lastName: String(form.lastName ?? ""),
      patronymic: String(form.patronymic ?? ""),
      email: String(form.email ?? ""),
      phone: String(form.phone ?? ""),
      telegram: String(form.telegram ?? ""),
      comment: String(form.comment ?? ""),
      deliveryPrice,
      subtotal,
      checkoutAttemptKey: attemptKey,
      office: form.office,
      city: form.city,
      total: subtotal + deliveryPrice,
      items: validCartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await createOrder(payload);

      if (response.alreadyPaid) {
        showToast("этот заказ уже оплачен", "success");
        return;
      }

      const confirmationUrl = response.confirmationUrl;

      if (!confirmationUrl) {
        showToast("Ошибка сервера: не получили ссылку на оплату", "error");
        throw new Error("Не получили ссылку на оплату");
      }

      window.location.href = confirmationUrl;
      // resetForm();
      // updateFormResetKey();
      // clearItems();
      // showToast("----", "success"); // тут инфа о том куда приедет заказ + сделать рассылку на почту
    } catch (e) {
      showToast("не получилось создать заказ.", "error");
      console.error("не получилось создать заказ:", e);
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  return (
    <form className={cls.main} onSubmit={handleSubmit}>
      <div className={cls.wrapper}>
        <O_CheckoutCartSummary
          className={cls.column}
          cartObjects={cartObjects}
          subtotal={subtotal}
          showToast={showToast}
        />

        <O_CheckoutCustomerFields className={cls.column} />

        <O_CheckoutDeliveryFields
          className={cls.column}
          cartPackageParams={cartPackageParams}
          cartItems={validCartItems}
          isSubmitting={isSubmitting}
          isCartEmpty={isCartEmpty}
          showToast={showToast}
          key={formResetKey}
        />
      </div>
      {toast ? (
        <A_Toast
          type={toastType}
          message={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </form>
  );
};

export default CheckoutLayer;
