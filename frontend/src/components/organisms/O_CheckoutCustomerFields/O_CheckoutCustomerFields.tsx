import cls from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields.module.css";

import React, { ComponentPropsWithoutRef } from "react";
import M_Input from "../../molecules/M_Input/M_Input";
import { Link } from "react-router";
import M_InputCheckbox from "../../molecules/M_InputCheckbox/M_InputCheckbox";

const O_CheckoutCustomerFields = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => {
  return (
    <div className={className} {...props}>
      <p>ваши данные:</p>
      <M_Input
        name="firstName"
        id={"имя"}
        required
        placeholder="имя*"
      ></M_Input>
      <M_Input
        name="lastName"
        id={"фамилия"}
        required
        placeholder="фамилия*"
      ></M_Input>
      <M_Input
        name="patronymic"
        id={"отчество"}
        placeholder="отчество"
      ></M_Input>
      <M_Input
        name="email"
        type="email"
        id={"почта"}
        required
        placeholder="почта*"
      ></M_Input>
      <M_Input
        name="phone"
        id={"телефон"}
        required
        placeholder="телефон*"
      ></M_Input>
      <M_Input
        id={"телеграмм"}
        name="telegram"
        required
        placeholder="телеграмм (@example)"
      ></M_Input>
      <div className={""}>
        <M_InputCheckbox required className={cls.checkbox} id="policy" />
        <label className={""} htmlFor="policy">
          Я принимаю условия
          <Link to="/info/offer" onClick={(event) => event.stopPropagation()}>
            Публичной оферты
          </Link>
          и соглашаюсь с
          <Link to="/info/privacy" onClick={(event) => event.stopPropagation()}>
            Политикой обработки персональных данных
          </Link>
          *
        </label>
      </div>
      <div className={""}>
        <M_InputCheckbox required className={cls.checkbox} id="coolness" />
        <label className={""} htmlFor="coolness">
          Я очень крут*
        </label>
      </div>
    </div>
  );
};

export default O_CheckoutCustomerFields;
