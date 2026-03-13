import cls from "@/components/M_itemCard/M_itemCard.module.css";
import img from "@/assets/images/bg-items/Frame 29.png";

import React from "react";
import { DbObject } from "@/shared/types/object";
import { Link } from "react-router";

type Props = {
  object: DbObject;
};

const M_itemCard = ({ object }: Props) => {
  return (
    <Link to={""}>
      <div className={cls.wrapper}>
        <img src={object.img} alt="img" className={cls.img} />
        <span className={cls.id}>0{object.id}</span>
        <div className={cls.info}>
          <span>{object.name}</span>
          <span>{object.prise}</span>
        </div>
      </div>
    </Link>
  );
};

export default M_itemCard;
