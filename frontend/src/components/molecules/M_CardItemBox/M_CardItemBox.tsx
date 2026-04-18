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

  const image = object.images.find((image) => image.position === 1);
  return (
    <div className={cls.wrapper}>
      <div className={cls.img}>
        <img src={image.url} alt="cardImage" />
      </div>
      <div className={cls.info}>
        <div className={cls.left}>
          <div className={cls.innerleft}>
            <span>
              {object.name} ({object.order})
            </span>
          </div>
          <div>
            <A_Button type="button" onClick={() => decreaseItem(object.id)}>
              —
            </A_Button>
            {object.quantity}
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
