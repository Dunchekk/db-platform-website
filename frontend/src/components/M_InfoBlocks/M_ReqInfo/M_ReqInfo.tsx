import cls from "@/components/M_InfoBlocks/M_ReqInfo/M_ReqInfo.module.css";
import React from "react";

type Props = { addClasses: string };

const M_ReqInfo = ({ addClasses }: Props) => {
  return (
    <div className={addClasses}>
      <div className={cls.left}>
        <p>DB:</p>
        <p>
          Публикация реквизитов — требование Закона о защите прав потребителей.
          Можете проверить мою регистрацию на сайте ФНС, направить претензию по
          адресу регистрации или подать на меня в суд. Но сначала лучше просто в
          тг напишите, ладно?
        </p>
      </div>
      <div>
        <p>Реквизиты:</p>
        <p>
          {"ИП [ФИО полностью]"}
          <br />
          {"ИНН: [номер]"}
          <br />
          {"ОГРНИП: [номер]"}
          <br />
          {"Адрес регистрации: [адрес]"}
          <br />
          {"Email: [email]"}
          <br />
          {"Телефон: [номер]"}
        </p>
      </div>
    </div>
  );
};

export default M_ReqInfo;
