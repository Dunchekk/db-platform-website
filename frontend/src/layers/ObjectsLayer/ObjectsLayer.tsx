import React from "react";
import cls from "@/layers/ObjectsLayer/ObjectsLayer.module.css";
import M_itemCard from "@/components/M_itemCard/M_itemCard";
// import { useObjects } from "@/shared/objects/objects.context"
import Objects from "@/mocks/objects.json";
import { DbObject } from "@/shared/types/object";

const ObjectsLayer = () => {
  // const { objects, objectsById, isLoading, error } = useObjects();

  const objects: DbObject[] = Objects;
  const object: DbObject = objects[0];

  return (
    <div className={cls.main}>
      <M_itemCard object={object} />
    </div>
  );
};

export default ObjectsLayer;
