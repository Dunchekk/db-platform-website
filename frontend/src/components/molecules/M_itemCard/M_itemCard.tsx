import cls from "@/components/molecules/M_itemCard/M_itemCard.module.css";
import React, { ComponentPropsWithoutRef } from "react";
import { DbObject } from "@/shared/types/object.types";

type Props = {
  object: DbObject;
  className?: string;
} & ComponentPropsWithoutRef<"div">;

const M_itemCard = ({ object, className, ...rest }: Props) => {
  const wrapperClassName = className
    ? `${cls.wrapper} ${className}`
    : cls.wrapper;
  const infoClassName = className ? `${cls.info} ${className}` : cls.info;
  const id = +object.id <= 9 ? "0" + object.id : object.id;

  return (
    <div className={wrapperClassName} {...rest}>
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
