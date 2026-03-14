import React from "react";
import cls from "@/layers/ObjectsLayer/ObjectsLayer.module.css";
import M_itemCard from "@/components/M_itemCard/M_itemCard";
import { DbObject } from "@/shared/types/object";
import { useObjects } from "@/shared/objects/objects.context";
import { useLayersStore } from "@/features/layer-switching/layers.store";

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

  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <div className={cls.wrapper2}>
          {isLoading && <div>Loading...</div>}
          {error && <div>{error}</div>}
          {objects.map((obj: DbObject) => {
            return (
              <div
                key={obj.id}
                onClick={() => {
                  setActiveObjectId(obj.id);
                  openLayer("details");
                }}
                style={{ cursor: "pointer" }}
              >
                <M_itemCard addClasses={wrapperClasses} object={obj} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ObjectsLayer;
