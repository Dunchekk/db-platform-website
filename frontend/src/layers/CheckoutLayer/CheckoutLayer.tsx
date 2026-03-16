import React from "react";
import cls from "@/layers/CheckoutLayer/CheckoutLayer.module.css";
import M_CardItemBox from "@/components/M_CardItemBox/M_CardItemBox";

import objects from "@/mocks/objects.json";
import { DbObject } from "@/shared/types/object";
import M_Input from "@/components/M_Input/M_Input";
import M_InputCheckbox from "@/components/M_InputCheckbox/M_InputCheckbox";

const object: DbObject = objects[0];

const CheckoutLayer = () => {
  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <div className={cls.third + " " + cls.firstthird}>
          <div>
            заказ:
            <div className={cls.firstborder}>
              <M_CardItemBox object={object} cardInfo={1} />
              <M_CardItemBox object={object} cardInfo={1} />
              <M_CardItemBox object={object} cardInfo={1} />
            </div>
            <M_Input id={"sl"} placeholder="комментарий к заказу"></M_Input>
            <p className={cls.p}>
              Оплата проходит через ЮKassa. Данные карт не сохраняем.
            </p>
          </div>

          <div>
            <span>итого:</span>{" "}
            <div className={cls.prise}>
              <span>(?) </span>
              {object.prise} ₽
            </div>
          </div>
        </div>
        <div className={cls.third}>
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
          <div className={cls.checkboxwrapper}>
            <M_InputCheckbox required className={cls.checkbox} id="policy" />
            <label htmlFor="policy">
              Я принимаю условия Публичной оферты и соглашаюсь с Политикой
              обработки персональных данных*
            </label>
          </div>
          <div className={cls.checkboxwrapper2}>
            <M_InputCheckbox required className={cls.checkbox} id="coolness" />
            <label htmlFor="coolness">Я очень крут*</label>
          </div>
        </div>
        <div className={cls.thirdthird}>
          <div>
            <p>доставка:</p>
            <M_Input placeholder="город*" />
            <div className={cls.checkboxwrapper3}>
              <M_InputCheckbox required className={cls.checkbox} id="cdek1" />
              <label htmlFor="cdek1">СДЕК до ПВЗ от 3 дней (400 ₽)</label>
            </div>
            <div className={cls.checkboxwrapper4}>
              <M_InputCheckbox required className={cls.checkbox} id="cdek2" />
              <label htmlFor="cdek2">СДЕК курьером от 2 дней (780 ₽)</label>
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

              <span>изменить ↑</span>
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
