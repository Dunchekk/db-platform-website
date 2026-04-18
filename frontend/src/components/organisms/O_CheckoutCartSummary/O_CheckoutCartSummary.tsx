import cls from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary.module.css";

import React, { ComponentPropsWithoutRef } from "react";
import W_CardItemsWrapper from "../../wrappers/W_CardItemsWrapper/W_CardItemsWrapper";
import { CartViewObject } from "@/shared/types/object.types";
import M_Input from "../../molecules/M_Input/M_Input";

type Props = {
  cartObjects: CartViewObject[];
  subtotal: number;
  className?: string;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutCartSummary = ({
  cartObjects,
  className,
  subtotal,
  ...props
}: Props) => {
  return (
    <div className={className} {...props}>
      <div>
        заказ:
        <W_CardItemsWrapper objects={cartObjects} />
      </div>

      <div>
        <div className={cls.prices}>
          <span>сумма:</span>
          <span>{subtotal} ₽</span>
        </div>
        <div className={cls.prices}>
          <span>доставка:</span>
          <span>(?)</span> {/* сюда позже включаем доставку */}
        </div>
      </div>

      <M_Input
        id={"comment"}
        name="comment"
        placeholder="комментарий к заказу"
      ></M_Input>

      <p className={cls.opacity}>
        Оплата проходит через ЮKassa. Данные карт не сохраняем.
      </p>

      <div className={cls.final}>
        <span>итого:</span>
        <span>(?) {subtotal} ₽</span>
      </div>
    </div>
  );
};

export default O_CheckoutCartSummary;
