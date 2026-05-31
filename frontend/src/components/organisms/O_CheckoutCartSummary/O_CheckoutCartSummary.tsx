import cls from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary.module.css";

import React, { ComponentPropsWithoutRef } from "react";
import W_CardItemsWrapper from "../../wrappers/W_CardItemsWrapper/W_CardItemsWrapper";
import { CartViewObject } from "@/shared/types/object.types";
import M_Input from "../../molecules/M_Input/M_Input";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";

type Props = {
  cartObjects: CartViewObject[];
  className?: string;
  subtotal: number;
  showToast: (message: string, type: "default" | "success" | "error") => void;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutCartSummary = ({
  cartObjects,
  className,
  subtotal,
  showToast,
  ...props
}: Props) => {
  const setField = useCheckoutFormInputs((state) => state.setField);
  const comment = useCheckoutFormInputs((state) => state.form.comment);

  // цены
  const deliveryPrice = useCheckoutFormInputs(
    (state) => state.form.deliveryPrice
  );

  const handleCommChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const value = e.target.value;
    setField("comment", value);
  };

  return (
    <div className={className} {...props}>
      <div>
        заказ:
        <W_CardItemsWrapper objects={cartObjects} />
      </div>

      <div>
        <div className={cls.prices}>
          <span>сумма:</span>
          <span>{typeof subtotal === "number" ? subtotal : "(?)"} ₽</span>
        </div>
        <div className={cls.prices}>
          <span>доставка:</span>
          <span>
            {typeof deliveryPrice === "number" ? (
              deliveryPrice
            ) : (
              <span
                onMouseEnter={() =>
                  showToast(
                    "ввдеите данные о доставке, чтобы узнать итоговую цену",
                    "default"
                  )
                }
              >
                (?){" "}
              </span>
            )}{" "}
            ₽
          </span>
          {/* сюда позже включаем доставку */}
        </div>
      </div>

      <M_Input
        id={"comment"}
        name="comment"
        placeholder="комментарий к заказу"
        value={comment}
        onChange={handleCommChange}
      ></M_Input>

      <p className={cls.opacity}>
        Оплата проходит через ЮKassa. Данные карт не сохраняем.
      </p>

      <div className={cls.final}>
        <span>итого:</span>
        <span>
          {typeof deliveryPrice !== "number" ? (
            <span
              onMouseEnter={() =>
                showToast(
                  "ввдеите данные о доставке, чтобы узнать итоговую цену",
                  "default"
                )
              }
            >
              (?){" "}
            </span>
          ) : null}
          {typeof deliveryPrice === "number"
            ? subtotal + deliveryPrice
            : subtotal}{" "}
          ₽
        </span>
      </div>
    </div>
  );
};

export default O_CheckoutCartSummary;
