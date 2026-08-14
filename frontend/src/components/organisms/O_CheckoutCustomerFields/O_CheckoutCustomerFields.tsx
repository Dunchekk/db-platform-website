import cls from "@/components/organisms/O_CheckoutCustomerFields/O_CheckoutCustomerFields.module.css";

import React, { ComponentPropsWithoutRef } from "react";
import M_Input from "../../molecules/M_Input/M_Input";
import { Link } from "react-router";
import M_InputCheckbox from "../../molecules/M_InputCheckbox/M_InputCheckbox";
import {
  CheckoutFormInputs,
  useCheckoutFormInputs,
} from "@/features/checkout/formData.store";

const O_CheckoutCustomerFields = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => {
  const setField = useCheckoutFormInputs((state) => state.setField);
  const offerAccepted = useCheckoutFormInputs(
    (state) => state.form.offerAccepted
  );
  const personalDataConsentAccepted = useCheckoutFormInputs(
    (state) => state.form.personalDataConsentAccepted
  );

  const firstName = useCheckoutFormInputs((state) => state.form.firstName);
  const lastName = useCheckoutFormInputs((state) => state.form.lastName);
  const patronymic = useCheckoutFormInputs((state) => state.form.patronymic);
  const email = useCheckoutFormInputs((state) => state.form.email);
  const phone = useCheckoutFormInputs((state) => state.form.phone);
  const telegram = useCheckoutFormInputs((state) => state.form.telegram);

  const handleChange = (value: string, field: keyof CheckoutFormInputs) => {
    setField(field, value);
  };

  return (
    <div className={className} {...props}>
      <div>
        <p>ваши данные:</p>
        <M_Input
          required
          placeholder="имя*"
          value={firstName}
          onChange={(e) => handleChange(e.target.value, "firstName")}
        ></M_Input>
        <M_Input
          required
          placeholder="фамилия*"
          value={lastName}
          onChange={(e) => handleChange(e.target.value, "lastName")}
        ></M_Input>
        <M_Input
          placeholder="отчество"
          value={patronymic}
          onChange={(e) => handleChange(e.target.value, "patronymic")}
        ></M_Input>
        <M_Input
          type="email"
          required
          placeholder="почта*"
          value={email}
          onChange={(e) => handleChange(e.target.value, "email")}
        ></M_Input>
        <M_Input
          required
          placeholder="телефон*"
          type="phone"
          value={phone}
          onChange={(e) => handleChange(e.target.value, "phone")}
        ></M_Input>
        <M_Input
          placeholder="телеграмм (@example)"
          value={telegram}
          onChange={(e) => handleChange(e.target.value, "telegram")}
        ></M_Input>
      </div>
      <div className={cls.checkboxes}>
        <M_InputCheckbox
          required
          className={cls.checkbox}
          checked={offerAccepted}
          id="policy"
          onChange={() => {
            setField("offerAccepted", !offerAccepted);
          }}
        >
          <label htmlFor="policy">
            Я принимаю условия{" "}
            <Link
              to="/info/offer"
              className={cls.links}
              onClick={(event) => event.stopPropagation()}
            >
              Публичной оферты
            </Link>
            .
          </label>
        </M_InputCheckbox>
        <M_InputCheckbox
          required
          className={cls.checkbox}
          checked={personalDataConsentAccepted}
          id="personal-data-consent"
          onChange={() => {
            setField(
              "personalDataConsentAccepted",
              !personalDataConsentAccepted
            );
          }}
        >
          <label htmlFor="personal-data-consent">
            Я даю согласие на обработку персональных данных на условиях{" "}
            <Link
              to="/info/personal-data-consent"
              className={cls.links}
              onClick={(event) => event.stopPropagation()}
            >
              Согласия
            </Link>{" "}
            и подтверждаю, что ознакомился с{" "}
            <Link
              to="/info/privacy"
              className={cls.links}
              onClick={(event) => event.stopPropagation()}
            >
              Политикой
            </Link>{" "}
            обработки персональных данных.
          </label>
        </M_InputCheckbox>
      </div>
    </div>
  );
};

export default O_CheckoutCustomerFields;
