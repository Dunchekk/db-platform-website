import cls from "@/components/molecules/M_InfoBlocks/M_ReqInfo/M_ReqInfo.module.css";
import React, { ComponentPropsWithoutRef } from "react";

// поменять моковую информацию во всех инфо блоках

type Props = { className: string } & ComponentPropsWithoutRef<"div">;

const M_ReqInfo = ({ className, ...rest }: Props) => {
  return (
    <div className={className} {...rest}>
      <div className={[cls.left, cls.leftTop].join(" ")}>
        <p>&nbsp;&nbsp;DB:</p>
        <p>
          Публикация реквизитов — требование Закона о защите прав потребителей.
          Можете проверить мою регистрацию на сайте ФНС, направить претензию по
          адресу регистрации или подать на меня в суд. Но сначала лучше просто в
          тг напишите, ладно?
        </p>
      </div>
      <div className={[cls.left, cls.leftadd].join(" ")}>
        <p>Реквизиты:</p>
        <p>
          {"ИП Дубовицкий Иван Максимович"}
          <br />
          {"ИНН: 000000000000"}
          <br />
          {"ОГРНИП: 000000000000000"}
          <br />
          {"Адрес регистрации: [адрес]"}
          <br />
          {"Email: db-example@mail.ru"}
          <br />
          {"Телефон: +7 495 123-45-67"}
        </p>
      </div>
    </div>
  );
};

export default M_ReqInfo;
