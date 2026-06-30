import React, { useState } from "react";
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
import { createOrder } from "@/shared/api/checkout";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";

const CheckoutLayer = () => {
  const allObjects: DbObject[] = useObjects((state) => state.objects);
  const cartItems: CheckoutItem[] = useCheckoutItems((state) => state.items);
  const deliveryPrice = useCheckoutFormInputs(
    (state) => state.form.deliveryPrice
  );

  // const clearItems = useCheckoutItems((state) => state.clearItems);

  const cartObjects: CartViewObject[] = allObjects
    .filter((object) => cartItems.some((item) => item.itemId === object.id))
    .map((dbobject) => {
      const cartItem = cartItems.find((item) => item.itemId === dbobject.id);
      return {
        ...dbobject,
        quantity: cartItem.quantity ?? 0,
      };
    });

  // toast ↓
  const [toast, setToast] = useState<string | null>(null);
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

  const isCartEmpty = cartItems.length === 0;

  const subtotal = cartObjects.reduce((sum, object) => {
    return sum + object.price * object.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    let attemptKey;

    const newFingerPrint = JSON.stringify({
      items: [...cartItems].sort((a, b) => a.itemId - b.itemId),
      cityCode: form.city?.code ?? null,
      officeCode: form.office?.code ?? null,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      comment: form.comment.trim(),
    });

    if (form.checkoutAttemptKey && form.fingerprint === newFingerPrint) {
      attemptKey = form.checkoutAttemptKey;
    } else {
      attemptKey = crypto.randomUUID() as string;
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
      items: cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await createOrder(payload);
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
      if (e instanceof Error) {
        showToast(`не получилось создать заказ: ${e.message}`, "error");
      }
      console.log(e);
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
