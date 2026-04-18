import React from "react";
import cls from "@/layers/CheckoutLayer/CheckoutLayer.module.css";
import { CartViewObject, DbObject } from "@/shared/types/object.types";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useObjects } from "@/features/objects/objects.store";
import { CheckoutItem } from "@/shared/types/checkout.types";
import O_CheckoutCartSummary from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary";
import O_CheckoutCustomerFields from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields";
import O_CheckoutDeliveryFields from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields";

const CheckoutLayer = () => {
  const allObjects: DbObject[] = useObjects((state) => state.objects);
  const cartItems: CheckoutItem[] = useCheckoutItems((state) => state.items);

  const cartObjects: CartViewObject[] = allObjects
    .filter((object) => cartItems.some((item) => item.itemId === object.id))
    .map((dbobject) => {
      const cartItem = cartItems.find((item) => item.itemId === dbobject.id);
      return {
        ...dbobject,
        quantity: cartItem.quantity ?? 0,
      };
    });

  const subtotal = cartObjects.reduce((sum, object) => {
    return sum + object.price * object.quantity;
  }, 0);

  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <O_CheckoutCartSummary cartObjects={cartObjects} subtotal={subtotal} />

        <O_CheckoutCustomerFields />

        <O_CheckoutDeliveryFields />
      </div>
    </div>
  );
};

export default CheckoutLayer;
