import cls from "@/components/molecules/M_CardItemBox/M_CardItemBox.module.css";

import { CartViewObject } from "@/shared/types/object.types";
import A_Button from "../../atoms/A_Button/A_Button";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { ComponentPropsWithoutRef } from "react";

type Props = {
  object: CartViewObject;
} & ComponentPropsWithoutRef<"div">;

const M_CardItemBox = ({ object }: Props) => {
  const decreaseItem = useCheckoutItems((state) => state.decreaseItem);
  const addItem = useCheckoutItems((state) => state.addItem);
  const API_URL = __API_URL__;
  const position =
    object.position <= 9 ? "0" + `${object.position}` : object.position;

  const image = object.images.find((image) => image.position === 1);
  return (
    <div className={cls.wrapper}>
      <div className={cls.img}>
        <img className={cls.image} src={API_URL + image.url} alt="cardImage" />
      </div>
      <div className={cls.info}>
        <div className={cls.left}>
          <div className={cls.innerleft}>
            <span>
              {object.name} ({position})
            </span>
          </div>
          <div className={cls.buttons}>
            <A_Button type="button" onClick={() => decreaseItem(object.id)}>
              —
            </A_Button>
            <span>{object.quantity}</span>
            <A_Button type="button" onClick={() => addItem(object.id)}>
              +
            </A_Button>
          </div>
        </div>
        <div className={cls.prise}>{object.price} ₽</div>
      </div>
    </div>
  );
};

export default M_CardItemBox;
