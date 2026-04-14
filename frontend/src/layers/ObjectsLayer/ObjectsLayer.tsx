import React from "react";
import cls from "@/layers/ObjectsLayer/ObjectsLayer.module.css";
import M_itemCard from "@/components/M_itemCard/M_itemCard";
import { DbObject } from "@/shared/types/object.types";
import { useObjects } from "@/shared/objects/objects.context";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import Q_InfoButtons from "@/components/Q_InfoButtons/Q_InfoButtons";
import { useAuth } from "@/features/auth/auth.store";

const PROTOTYPE_ONLY_FIRST_OBJECT_CLICKABLE = true;

const ObjectsLayer = () => {
  const { objects, isLoading, error } = useObjects();
  const openLayer = useLayersStore((state) => state.openLayer);
  const setActiveObjectId = useLayersStore((state) => state.setActiveObjectId);

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
          {isLoading && <div>Loading...</div>}
          {error && <div>{error}</div>}
          {objects.map((obj: DbObject, index) => {
            const isClickable =
              !PROTOTYPE_ONLY_FIRST_OBJECT_CLICKABLE || index === 0;
            return (
              <div
                key={obj.id}
                onClick={
                  isClickable
                    ? () => {
                        setActiveObjectId(String(obj.id));
                        openLayer("details");
                      }
                    : undefined
                }
                style={{ cursor: isClickable ? "pointer" : "default" }}
              >
                <M_itemCard addClasses={wrapperClasses} object={obj} />
              </div>
            );
          })}
        </div>
      </div>
      <Q_InfoButtons mode="objects" />
    </div>
  );
};

export default ObjectsLayer;
