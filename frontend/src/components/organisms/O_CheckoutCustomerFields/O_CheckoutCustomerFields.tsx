import cls from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields.module.css";

import React from "react";
import M_Input from "../../molecules/M_Input/M_Input";
import { Link } from "react-router";
import M_InputCheckbox from "../../molecules/M_InputCheckbox/M_InputCheckbox";

const O_CheckoutCustomerFields = () => {
  return (
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
          Я принимаю условия{" "}
          <Link
            to="/info/offer"
            className={cls.inlineLink}
            onClick={(event) => event.stopPropagation()}
          >
            Публичной оферты
          </Link>{" "}
          и соглашаюсь с{" "}
          <Link
            to="/info/privacy"
            className={cls.inlineLink}
            onClick={(event) => event.stopPropagation()}
          >
            Политикой обработки персональных данных
          </Link>
          *
        </label>
      </div>
      <div className={[cls.checkboxRow, cls.checkboxRowMtSm].join(" ")}>
        <M_InputCheckbox required className={cls.checkbox} id="coolness" />
        <label className={cls.checkboxLabel} htmlFor="coolness">
          Я очень крут*
        </label>
      </div>
    </div>
  );
};

export default O_CheckoutCustomerFields;
