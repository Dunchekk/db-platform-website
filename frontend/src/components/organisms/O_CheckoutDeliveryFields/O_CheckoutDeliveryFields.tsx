import React from "react";
import M_InputCheckbox from "../../molecules/M_InputCheckbox/M_InputCheckbox";
import M_Input from "../../molecules/M_Input/M_Input";
import type { ComponentPropsWithoutRef } from "react";
import cls from "@/components/organisms/O_CheckoutDeliveryFields/O_CheckoutDeliveryFields.module.css";
import A_Button from "../../atoms/A_Button/A_Button";

type Props = {
  isCartEmpty: boolean;
  showToast: (message: string, type: "default" | "success" | "error") => void;
} & ComponentPropsWithoutRef<"div">;

const O_CheckoutDeliveryFields = ({
  isCartEmpty,
  className,
  showToast,
  ...props
}: Props) => {
  return (
    <div className={className} {...props}>
      <p>доставка:</p>
      <M_Input placeholder="город*" />

      <div>
        <M_InputCheckbox id="cdek1">
          <label htmlFor="cdek1">СДЕК до ПВЗ от 3 дней (400 ₽)</label>
        </M_InputCheckbox>
        <M_InputCheckbox id="cdek2">
          <label htmlFor="cdek2">СДЕК курьером от 2 дней (780 ₽)</label>
        </M_InputCheckbox>
      </div>

      <div>
        <p>пункт получения:</p>
        <span className={cls.dotted}>выбрать ↓</span>
        <p>
          MSK2589, Москва, ул. Генерала Глаголева
          <br />
          Адрес: ул. Генерала Глаголева, 22, корп. 1<br />
          Время работы: Пн-Пт 09:00-21:00, Сб-Вс 10:00-20:00
          <br />
          Телефон: +79932658365
        </p>

        <span className={cls.dotted}>изменить ↑</span>
        <br />
        <span>сроки: ~от 2 до 5 дней</span>
      </div>

      <span
        onMouseEnter={() => {
          if (isCartEmpty) {
            showToast("добавтье что-то в корзину", "default");
          }
        }}
      >
        <A_Button className={cls.submit} type="submit" disabled={isCartEmpty}>
          {"————> оформить заказ"}
        </A_Button>
      </span>
    </div>
  );
};

export default O_CheckoutDeliveryFields;
