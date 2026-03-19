import React from "react";
import cls from "@/layers/CheckoutLayer/CheckoutLayer.module.css";
import W_CardItemsWrapper from "@/components/W_CardItemsWrapper/W_CardItemsWrapper";

import objects from "@/mocks/objects.json";
import { DbObject } from "@/shared/types/object";
import M_Input from "@/components/M_Input/M_Input";
import M_InputCheckbox from "@/components/M_InputCheckbox/M_InputCheckbox";

const object: DbObject = objects[0];

const CheckoutLayer = () => {
  const cardObjects: DbObject[] = [object];

  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
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
            <W_CardItemsWrapper objects={cardObjects} />
            <div className={cls.prisediv + " " + cls.prisediv1}>
              <span>сумма:</span>{" "}
              <div className={cls.sum}>{object.prise} ₽</div>
            </div>
            <div className={cls.prisediv}>
              <span>доставка:</span>{" "}
              <div className={cls.delivsum}>
                <span>(?) </span>
              </div>
            </div>
            <M_Input id={"sl"} placeholder="комментарий к заказу"></M_Input>
            <p className={cls.p}>
              Оплата проходит через ЮKassa. Данные карт не сохраняем.
            </p>
          </div>

          <div>
            <span>итого:</span>{" "}
            <div className={cls.prise}>
              <span>(?)&nbsp;</span>
              {object.prise} ₽
            </div>
          </div>
        </div>
        <div className={[cls.column, cls.columnGapSm].join(" ")}>
          <p>ваши данные:</p>
          <M_Input id={"имя"} required placeholder="имя*"></M_Input>
          <M_Input id={"фамилия"} required placeholder="фамилия*"></M_Input>
          <M_Input id={"отчество"} placeholder="отчество"></M_Input>
          <M_Input id={"почта"} required placeholder="почта*"></M_Input>
          <M_Input id={"телефон"} required placeholder="телефон*"></M_Input>
          <M_Input
            id={"телеграмм"}
            required
            placeholder="телеграмм (@example)"
          ></M_Input>
          <div className={[cls.checkboxRow, cls.checkboxRowMtLg].join(" ")}>
            <M_InputCheckbox required className={cls.checkbox} id="policy" />
            <label className={cls.checkboxLabel} htmlFor="policy">
              Я принимаю условия Публичной оферты и соглашаюсь с Политикой
              обработки персональных данных*
            </label>
          </div>
          <div className={[cls.checkboxRow, cls.checkboxRowMtSm].join(" ")}>
            <M_InputCheckbox required className={cls.checkbox} id="coolness" />
            <label className={cls.checkboxLabel} htmlFor="coolness">
              Я очень крут*
            </label>
          </div>
        </div>
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
          <span className={cls.order}>{"————> оформить заказ"}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutLayer;
