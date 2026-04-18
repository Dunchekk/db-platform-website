// import cls from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary.module.css";

import React, { ComponentPropsWithoutRef } from "react";
import W_CardItemsWrapper from "../../wrappers/W_CardItemsWrapper/W_CardItemsWrapper";
import { CartViewObject } from "@/shared/types/object.types";
import M_Input from "../../molecules/M_Input/M_Input";

type Props = {
  cartObjects: CartViewObject[];
  subtotal: number;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutCartSummary = ({ cartObjects, subtotal, ...props }: Props) => {
  return (
    <div className={""} {...props}>
      <div>
        заказ:
        <W_CardItemsWrapper objects={cartObjects} />
        <div className={""}>
          <span>сумма:</span>
          <div className={""}>{subtotal} ₽</div>
        </div>
        <div className={""}>
          {/* сюда позже включаем доставку */}
          <span>доставка:</span>
          <div className={""}>
            <span>(?)</span>
          </div>
        </div>
        <M_Input
          id={"sl"}
          name="comment"
          placeholder="комментарий к заказу"
        ></M_Input>
        <p className={""}>
          Оплата проходит через ЮKassa. Данные карт не сохраняем.
        </p>
      </div>

      <div className={""}>
        <span>итого:</span>
        <div className={""}>
          <span>(?)</span>
          {subtotal} ₽
        </div>
      </div>
    </div>
  );
};

export default O_CheckoutCartSummary;
