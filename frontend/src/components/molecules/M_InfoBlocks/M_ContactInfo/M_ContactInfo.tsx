import React, { ComponentPropsWithoutRef } from "react";
import cls from "@/components/molecules/M_InfoBlocks/M_ContactInfo/M_ContactInfo.module.css";

type Props = { className: string } & ComponentPropsWithoutRef<"div">;

const M_ContactInfo = ({ className, ...rest }: Props) => {
  return (
    <div className={className} {...rest}>
      <div className={[cls.left, cls.leftTop].join(" ")}>
        <p>&nbsp;&nbsp;DB:</p>
        <p>
          Если возникли проблемы с заказом, доставкой и тому подобное, то
          быстрее всего решим, если напишете мне в телеграмме, отвечу в
          ближайшие пару дней. Почта тоже активна, но ответа, скорее всего,
          придется ждать дольше.
        </p>
      </div>
      <div className={[cls.contact, cls.left, cls.leftadd].join(" ")}>
        <div>
          <p>Контакты:</p>
          <p>
            Email: contact@db-platform.ru
            <br />
            Телефон: +7 964 555-60-42
            <br />
            Telegram: @umni0enivblii
          </p>
        </div>
        <div>
          <p>Дизайн и разработка:</p>
          <p>
            Email: vasilevaevdokia875@gmail.com
            <br />
            Telegram: @dunchek
          </p>
        </div>
      </div>
    </div>
  );
};

export default M_ContactInfo;
