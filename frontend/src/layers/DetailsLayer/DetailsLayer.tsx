import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import cls from "@/layers/DetailsLayer/DetailsLayer.module.css";
import M_ImageSlider from "@/components/molecules/M_ImageSlider/M_ImageSlider";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useObjects } from "@/features/objects/objects.store";

const DetailsLayer = () => {
  const { id } = useParams();
  const routeObjectId = typeof id === "string" ? id : null;
  const isDetailsLayerOpen = useLayersStore((state) =>
    state.openedLayers.includes("details")
  );
  const storeObjectId = useLayersStore((state) => state.activeObjectId);
  const lastStoreObjectId = useLayersStore((state) => state.lastActiveObjectId);
  const effectiveObjectId = routeObjectId ?? storeObjectId ?? lastStoreObjectId;
  const isDetailsContext = routeObjectId !== null || isDetailsLayerOpen;

  const closeLayer = useLayersStore((state) => state.closeLayer);

  const object = useObjects((state) => state.objects).find(
    (v) => v.id === Number(id)
  );

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const images = useMemo(() => {
    if (!object) return [];
    if (Array.isArray(object.images) && object.images.length > 0)
      return [...object.images]
        .sort((a, b) => a.position - b.position)
        .map((v) => v.url);
    return [];
  }, [object]);

  return (
    <div
      className={cls.main}
      onPointerDown={(event) => {
        if (!isDetailsContext) return;
        if (event.button !== 0) return;

        const wrapper = wrapperRef.current;
        const targetNode = event.target as Node | null;
        if (wrapper && targetNode && wrapper.contains(targetNode)) return;

        closeLayer("details");
      }}
    >
      <div className={cls.wrapper} ref={wrapperRef}>
        <button
          type="button"
          className={cls.back}
          onClick={() => closeLayer("details")}
        >
          Х
        </button>

        {object && (
          <div className={cls.content}>
            <div className={[cls.header, cls.mobileHeader].join(" ")}>
              <span>{object.name}</span>
              <span>{object.price} ₽</span>
              <span className={[cls.tocard, cls.mobileTocard].join(" ")}>
                + в корзину
              </span>
            </div>

            <M_ImageSlider
              key={effectiveObjectId ?? "no-object"}
              className={cls.obj}
              images={images}
              alt={object.name}
            />

            <div className={cls.info}>
              <div className={[cls.header, cls.desktopHeader].join(" ")}>
                <span>{object.name}</span>
                <span>{object.price} ₽</span>
              </div>
              <span className={cls.desktopOnlyBreaks}>
                <br />
                <br />
                <br />
                <br />
              </span>
              <div>
                {object.info.map((info, i) => {
                  if (info.title === "") return <br key={i} />;
                  return (
                    <div key={i}>
                      <span>{info.title}</span>: {info.description}
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
                  {object.points.map((p, i) => {
                    return <li key={i}>{p.point}</li>;
                  })}
                </ul>
              </div>
              <span className={[cls.tocard, cls.desktopTocard].join(" ")}>
                + в корзину
              </span>
            </div>
          </div>

          /* ------------------- */
        )}
      </div>
    </div>
  );
};

export default DetailsLayer;
