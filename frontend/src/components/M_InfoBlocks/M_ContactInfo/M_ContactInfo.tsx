import React from "react";
import cls from "@/components/M_InfoBlocks/M_ContactInfo/M_ContactInfo.module.css";

type Props = { addClasses: string };

const M_ContactInfo = ({ addClasses }: Props) => {
  return (
    <div className={addClasses}>
      <div className={cls.left}>
        <p>DB:</p>
        <p>
          Если возникли проблемы с заказом, доставкой и тому подобное, то
          быстрее всего решим, если напишете мне в телеграмме, отвечу в
          ближайшие пару (?) дней. Почта тоже активна, но ответа, скорее всего,
          придется ждать дольше.
        </p>
      </div>
      <div className={cls.contact}>
        <div>
          <p>Контакты:</p>
          <p>
            Email: [email]
            <br />
            Телефон: [номер]
            <br />
            tg: @blabla
          </p>
        </div>
        <div>
          <p>Дизайн и разработка:</p>
          <p>tg: @dunchek</p>
        </div>
      </div>
    </div>
  );
};

export default M_ContactInfo;
