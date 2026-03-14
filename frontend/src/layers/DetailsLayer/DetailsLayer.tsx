import React, { useMemo, useState } from "react";
import { useParams } from "react-router";

import cls from "@/layers/DetailsLayer/DetailsLayer.module.css";
import ImagesSlider from "@/components/ImagesSlider/ImagesSlider";
import { useObjects } from "@/shared/objects/objects.context";
import { useLayersStore } from "@/features/layer-switching/layers.store";

const DetailsLayer = () => {
  const { id } = useParams();
  const objectId = typeof id === "string" ? id : null;

  const { objectsById, isLoading, error } = useObjects();
  const closeLayer = useLayersStore((state) => state.closeLayer);

  const object = objectId ? objectsById[objectId] : undefined;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const images = useMemo(() => {
    if (!object) return [];
    if (Array.isArray(object.images) && object.images.length > 0)
      return object.images;
    return object.img ? [object.img] : [];
  }, [object]);

  return (
    <div className={cls.main}>
      <div className={cls.wrapper}>
        <button
          type="button"
          className={cls.back}
          onClick={() => closeLayer("details")}
        >
          ✕
        </button>

        {isLoading && <div>Loading...</div>}
        {error && <div>{error}</div>}

        {!isLoading && !error && !objectId && <div>Object id not found</div>}
        {!isLoading && !error && objectId && !object && (
          <div>Object {objectId} not found</div>
        )}

        {/* ------------------------------- */}

        {!isLoading && !error && object && (
          <div className={cls.content}>
            <ImagesSlider
              key={objectId ?? "no-object"}
              className={cls.obj}
              images={images}
              alt={object.name}
            />

            <div className={cls.info}>
              <span>{+object.id < 9 ? "0" + object.id : object.id}</span>
              <br />
              <span>{object.name}</span>
              <br />
              <br />
              <span>{object.prise} ₽</span>
              <br />
              <br />
              <span>
                {object.choise.map((c) => {
                  return <span key={c}>{c} </span>;
                })}
              </span>
              <br />
              <br />
              <br />
              <br />
              <div>
                {object.details.properties.map((p, i) => {
                  if (p.property === "") return <br key={i} />;
                  return (
                    <div key={i}>
                      <span>{p.property}</span>: {p.fill}
                      <br />
                    </div>
                  );
                })}
              </div>
              <br />
              <span
                className={cls.detailsToggle}
                role="button"
                tabIndex={0}
                onClick={() => setIsDetailsOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsDetailsOpen((prev) => !prev);
                  }
                }}
              >
                детали ↓
              </span>
              <div
                className={[
                  cls.details,
                  isDetailsOpen ? cls.detailsOpen : "",
                ].join(" ")}
              >
                <ul className={cls.ul}>
                  {object.details.points.map((p, i) => {
                    return <li key={i}>{p}</li>;
                  })}
                </ul>
              </div>
              <span className={cls.tocard}>+ в корзину</span>
            </div>
          </div>

          /* ------------------- */
        )}
      </div>
    </div>
  );
};

export default DetailsLayer;
