import React from "react";
import cls from "@/layers/ObjectsLayer/ObjectsLayer.module.css";
import M_itemCard from "@/components/molecules/M_itemCard/M_itemCard";
import { DbObject } from "@/shared/types/object.types";
import { useObjects } from "@/features/objects/objects.store";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import A_InfoButtons from "@/components/atoms/A_InfoButtons/A_InfoButtons";
import { useAuth } from "@/features/auth/auth.store";

const ObjectsLayer = () => {
  const openLayer = useLayersStore((state) => state.openLayer);
  const setActiveObjectId = useLayersStore((state) => state.setActiveObjectId);
  const objects = useObjects((state) => state.objects);

  const wrapperClasses =
    objects.length === 1
      ? cls.oneobj
      : objects.length === 2
        ? cls.twoobj
        : undefined;

  const isAuth = useAuth((state) => state.isAuth);
  console.log(isAuth);

  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <div className={cls.wrapper2}>
          {objects.map((obj: DbObject) => {
            return (
              <div
                key={obj.id}
                onClick={() => {
                  setActiveObjectId(String(obj.id));
                  openLayer("details");
                }}
              >
                <M_itemCard addClasses={wrapperClasses} object={obj} />
              </div>
            );
          })}
        </div>
      </div>
      <A_InfoButtons mode="objects" />
    </div>
  );
};

export default ObjectsLayer;
