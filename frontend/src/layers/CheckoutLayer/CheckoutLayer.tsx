import React, { useState } from "react";
import cls from "@/layers/CheckoutLayer/CheckoutLayer.module.css";
import { CartViewObject, DbObject } from "@/shared/types/object.types";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useObjects } from "@/features/objects/objects.store";
import { CheckoutBody, CheckoutItem } from "@/shared/types/checkout.types";
import O_CheckoutCartSummary from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary";
import O_CheckoutCustomerFields from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields";
import O_CheckoutDeliveryFields from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields";
import { createOrder } from "@/shared/api/checkout";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";

const CheckoutLayer = () => {
  const allObjects: DbObject[] = useObjects((state) => state.objects);
  const cartItems: CheckoutItem[] = useCheckoutItems((state) => state.items);
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

  const isCartEmpty = cartItems.length === 0;

  const subtotal = cartObjects.reduce((sum, object) => {
    return sum + object.price * object.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isCartEmpty) {
      showToast("добавьте что-нибудь в корзину", "error");
      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);
    const deliveryPrice = 0; // позже записать! мок
    const payload: CheckoutBody = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      patronymic: String(formData.get("patronymic") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      telegram: String(formData.get("telegram") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      deliveryPrice,
      subtotal,
      total: subtotal + deliveryPrice,
      items: cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
    };

    try {
      await createOrder(payload);
      showToast("заказ успешно создан!", "success");
      form.reset();
      clearItems();
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
        />

        <O_CheckoutCustomerFields className={cls.column} />

        <O_CheckoutDeliveryFields
          className={cls.column}
          isCartEmpty={isCartEmpty}
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
