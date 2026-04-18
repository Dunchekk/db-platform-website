import cls from "@/components/organisms/O_CheckoutCartSummary/O_CheckoutCartSummary.module.css";

import React from "react";
import W_CardItemsWrapper from "../../wrappers/W_CardItemsWrapper/W_CardItemsWrapper";
import { CartViewObject } from "@/shared/types/object.types";
import M_Input from "../../molecules/M_Input/M_Input";

type Props = {
  cartObjects: CartViewObject[];
  subtotal: number;
};

const O_CheckoutCartSummary = ({ cartObjects, subtotal }: Props) => {
  return (
    <div
      className={[
        cls.column,
        cls.columnGapSm,
        cls.columnBetween,
        cls.columnRelative,
      ].join(" ")}
    >
      <div>
        заказ:
        <W_CardItemsWrapper objects={cartObjects} />
        <div className={cls.prisediv + " " + cls.prisediv1}>
          <span>сумма:</span>
          <div className={cls.sum}>{subtotal} ₽</div>
        </div>
        <div className={cls.prisediv}>
          {/* сюда позже включаем доставку */}
          <span>доставка:</span>
          <div className={cls.delivsum}>
            <span>(?) </span>
          </div>
        </div>
        <M_Input id={"sl"} placeholder="комментарий к заказу"></M_Input>
        <p className={cls.p}>
          Оплата проходит через ЮKassa. Данные карт не сохраняем.
        </p>
      </div>

      <div className={cls.end}>
        <span>итого:</span>
        <div className={cls.prise}>
          <span>(?)&nbsp;</span>
          {subtotal} ₽
        </div>
      </div>
    </div>
  );
};

export default O_CheckoutCartSummary;
