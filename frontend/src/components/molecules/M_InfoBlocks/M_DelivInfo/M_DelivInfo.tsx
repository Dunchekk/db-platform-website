import React, { ComponentPropsWithoutRef } from "react";
import cls from "@/components/molecules/M_InfoBlocks/M_DelivInfo/M_DelivInfo.module.css";
import W_ScrollFadeBox from "@/components/wrappers/W_ScrollFadeBox/W_ScrollFadeBox";

type Props = { className: string } & ComponentPropsWithoutRef<"div">;

const M_DelivInfo = ({ className, ...rest }: Props) => {
  return (
    <div className={className} {...rest}>
      <div className={[cls.left, cls.leftTop].join(" ")}>
        <p>&nbsp;&nbsp;DB:</p>
        <p>
          Короче, мы отправляем заказы через СДЭК — можете выбрать ПВЗ или
          курьером. Сроки и стоимость показываем сразу при оформлении,
          оплачиваете всё вместе с заказом. Когда получаете посылку — лучше
          сразу проверить, всё ли ок. Если товар не подошёл — у вас есть 14 дней
          на возврат, а если вдруг брак — мы разберёмся и я заменю/верну деньги.
        </p>
      </div>
      <W_ScrollFadeBox
        className={[cls.left, cls.leftadd].join(" ")}
        height="var(--info-block-right-height)"
      >
        <div className={cls.content}>
          <p className={cls.title}>Доставка и возврат:</p>

          <section className={cls.section}>
            <h3 className={cls.sectionTitle}>1. Доставка</h3>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>Способы доставки</h4>
              <p>Доставка осуществляется транспортной компанией СДЭК:</p>
              <ul className={cls.list}>
                <li>до пункта выдачи заказов (ПВЗ)</li>
                <li>курьером по указанному адресу</li>
              </ul>
              <p>
                Выбор способа доставки осуществляется при оформлении заказа.
              </p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>Сроки доставки</h4>
              <ul className={cls.list}>
                <li>
                  Срок доставки зависит от региона и выбранного способа
                  получения.
                </li>
                <li>
                  Ориентировочные сроки отображаются при оформлении заказа.
                </li>
                <li>
                  Срок начинает исчисляться с момента подтверждения оплаты.
                </li>
                <li>
                  Стоимость доставки рассчитывается автоматически при оформлении
                  заказа и зависит от региона и выбранного способа доставки.
                </li>
                <li>Доставка оплачивается вместе с заказом.</li>
              </ul>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>Получение заказа</h4>
              <p>
                При получении заказа необходимо проверить внешний вид упаковки и
                комплектность товара. В случае обнаружения повреждений
                рекомендуется зафиксировать их при получении и сообщить нам по
                электронной почте: [email].
              </p>
            </div>
          </section>

          <section className={cls.section}>
            <h3 className={cls.sectionTitle}>2. Возврат товара</h3>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                2.1 Возврат товара надлежащего качества
              </h4>
              <p>
                Покупатель вправе отказаться от товара в любое время до его
                передачи, а также в течение 14 календарных дней после получения
                товара.
              </p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                Возврат возможен при условии:
              </h4>
              <ul className={cls.list}>
                <li>сохранения товарного вида</li>
                <li>отсутствия следов использования</li>
                <li>сохранения упаковки и комплектности</li>
              </ul>
              <p>
                Расходы по обратной доставке товара надлежащего качества
                оплачивает Покупатель.
              </p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                2.2 Возврат товара ненадлежащего качества
              </h4>
              <p>
                В случае обнаружения производственного брака или несоответствия
                товара заказу Покупатель вправе обратиться к Продавцу по
                электронной почте: [email].
              </p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                При подтверждении недостатков:
              </h4>
              <p>
                Товар подлежит замене или осуществляется возврат денежных
                средств
              </p>
              <p>Расходы на доставку в этом случае оплачивает Продавец.</p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                Порядок возврата денежных средств
              </h4>
              <p>
                Возврат денежных средств осуществляется тем же способом, которым
                была произведена оплата, в течение 10 рабочих дней с момента
                получения возвращённого товара и проверки его состояния.
              </p>
            </div>

            <div className={cls.subsection}>
              <h4 className={cls.subsectionTitle}>
                Контакты по вопросам возврата
              </h4>
              <p>Email: db-example@mail.ru</p>
              <p>Телефон: +7 945-123-45-67</p>
            </div>
          </section>
        </div>
      </W_ScrollFadeBox>
    </div>
  );
};

export default M_DelivInfo;
