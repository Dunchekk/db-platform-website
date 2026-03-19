import cls from "@/components/M_CardItemBox/M_CardItemBox.module.css";

import React from "react";

import objects from "@/mocks/objects";
import { DbObject } from "@/shared/types/object";

const object: DbObject = objects[0];

type Props = {
  object: DbObject;
  cardInfo: number;
};

const M_CardItemBox = ({ object, cardInfo }: Props) => {
  return (
    <div className={cls.wrapper}>
      <div className={cls.img}>
        <img src={object.img} alt="cardImage" />
      </div>
      <div className={cls.info}>
        <div className={cls.left}>
          <div className={cls.innerleft}>
            <span>
              {object.name} ({object.id})
            </span>
            <span>m</span>
          </div>
          <div>— {cardInfo} +</div>
        </div>
        <div className={cls.prise}>{object.prise} ₽</div>
      </div>
    </div>
  );
};

export default M_CardItemBox;
