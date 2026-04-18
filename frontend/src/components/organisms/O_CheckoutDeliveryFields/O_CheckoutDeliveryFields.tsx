import React from "react";
import M_InputCheckbox from "../../molecules/M_InputCheckbox/M_InputCheckbox";
import M_Input from "../../molecules/M_Input/M_Input";

import cls from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields.module.css";
import A_Button from "../../atoms/A_Button/A_Button";

const O_CheckoutDeliveryFields = () => {
  return (
    <div
      className={[cls.column, cls.columnBetween, cls.columnFullHeight].join(
        " "
      )}
    >
      <div>
        <p>доставка:</p>
        <M_Input placeholder="город*" />
        <div className={[cls.checkboxRow, cls.checkboxRowMtMd].join(" ")}>
          <M_InputCheckbox required className={cls.checkbox} id="cdek1" />
          <label className={cls.checkboxLabel} htmlFor="cdek1">
            СДЕК до ПВЗ от 3 дней (400 ₽)
          </label>
        </div>
        <div className={[cls.checkboxRow, cls.checkboxRowMt0].join(" ")}>
          <M_InputCheckbox required className={cls.checkbox} id="cdek2" />
          <label className={cls.checkboxLabel} htmlFor="cdek2">
            СДЕК курьером от 2 дней (780 ₽)
          </label>
        </div>

        <div className={cls.deliv}>
          <p>пункт получения:</p>
          <span className={cls.dotted}>выбрать ↓</span>
          <p className={cls.adress}>
            MSK2589, Москва, ул. Генерала Глаголева
            <br />
            Адрес: ул. Генерала Глаголева, 22, корп. 1<br />
            Время работы: Пн-Пт 09:00-21:00, Сб-Вс 10:00-20:00
            <br />
            Телефон: +79932658365
          </p>

          <span className={cls.dotted}>изменить ↑</span>
          <br />
          <span className={cls.deliv}>сроки: ~от 2 до 5 дней</span>
        </div>
      </div>
      <A_Button className={cls.order}>{"————> оформить заказ"}</A_Button>
    </div>
  );
};

export default O_CheckoutDeliveryFields;
