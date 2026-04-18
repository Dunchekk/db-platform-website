import cls from "@/components/molecules/M_itemCard/M_itemCard.module.css";
// import img from "@/assets/images/bg-items/Frame 29.png";

import React from "react";
import { DbObject } from "@/shared/types/object.types";

type Props = {
  object: DbObject;
  addClasses?: string;
};

const M_itemCard = ({ object, addClasses }: Props) => {
  const wrapperClassName = addClasses
    ? `${cls.wrapper} ${addClasses}`
    : cls.wrapper;
  const infoClassName = addClasses ? `${cls.info} ${addClasses}` : cls.info;
  const id = +object.id <= 9 ? "0" + object.id : object.id;

  return (
    <div className={wrapperClassName}>
      <img
        src={object.images.find((v) => Number(v.position) === 1).url}
        alt="img"
        className={cls.img}
      />
      <span className={cls.id}>{id}</span>
      <div className={infoClassName}>
        <span>{object.name}</span>
        <span>{object.price} ₽</span>
      </div>
    </div>
  );
};

export default M_itemCard;
