import cls from "@/components/molecules/M_itemCard/M_itemCard.module.css";
import React, { ComponentPropsWithoutRef } from "react";
import { DbObject } from "@/shared/types/object.types";
import { useAuth } from "@/features/auth/auth.store";
import A_Button from "@/components/atoms/A_Button/A_Button";
import { deleteItem, getItems } from "@/shared/api/objects";
import { useObjects } from "@/features/objects/objects.store";

type Props = {
  object: DbObject;
  className?: string;
  showToast: (message: string, type: "error" | "success" | "default") => void;
} & ComponentPropsWithoutRef<"div">;

const M_itemCard = ({ object, className, showToast, ...rest }: Props) => {
  const wrapperClassName = className
    ? `${cls.wrapper} ${className}`
    : cls.wrapper;
  const infoClassName = className ? `${cls.info} ${className}` : cls.info;
  const id = +object.id <= 9 ? "0" + object.position : object.position;

  const isAuth = useAuth((state) => state.isAuth);
  const API_URL = __API_URL__;

  const setObjects = useObjects((state) => state.setObjects);

  return (
    <div className={wrapperClassName} {...rest}>
      <img
        src={API_URL + object.images.find((v) => Number(v.position) === 1)?.url}
        alt="img"
        className={cls.img}
      />
      <span className={cls.id}>{id}</span>
      <div className={infoClassName}>
        <span>{object.name}</span>
        <span>{object.price} ₽</span>
        {isAuth ? (
          <A_Button
            onClick={async (e) => {
              e.stopPropagation();

              try {
                await deleteItem(object.id);
                showToast("объект удалён", "default");

                const data = await getItems();
                setObjects(data);
              } catch (e) {
                if (e instanceof Error) {
                  showToast(`не удалось удалить объект: ${e.message}`, "error");
                }
                console.log(e);
              }
            }}
            className={cls.delete}
          >
            X удалить
          </A_Button>
        ) : null}
      </div>
    </div>
  );
};

export default M_itemCard;
