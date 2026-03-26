import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import cls from "@/layers/DetailsLayer/DetailsLayer.module.css";
import M_ImageSlider from "@/components/M_ImageSlider/M_ImageSlider";
import { useObjects } from "@/shared/objects/objects.context";
import { useLayersStore } from "@/features/layer-switching/layers.store";

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

  const { objectsById, isLoading, error } = useObjects();
  const closeLayer = useLayersStore((state) => state.closeLayer);

  const object = effectiveObjectId ? objectsById[effectiveObjectId] : undefined;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const images = useMemo(() => {
    if (!object) return [];
    if (Array.isArray(object.images) && object.images.length > 0)
      return object.images;
    return object.img ? [object.img] : [];
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

        {isLoading && <div>Loading...</div>}
        {error && <div>{error}</div>}

        {isDetailsContext && !isLoading && !error && !effectiveObjectId && (
          <div>Object id not found</div>
        )}
        {isDetailsContext &&
          !isLoading &&
          !error &&
          effectiveObjectId &&
          !object && <div>Object {effectiveObjectId} not found</div>}

        {/* ------------------------------- */}

        {!isLoading && !error && object && (
          <div className={cls.content}>
            <div className={[cls.header, cls.mobileHeader].join(" ")}>
              <span>{object.name}</span>
              <span>{object.prise} ₽</span>
              <div className={cls.choiseblock}>
                {object.choise.map((c, i) => {
                  const choise = i === 0 ? cls.ch : "";
                  return (
                    <div className={choise} key={c}>
                      {c}
                    </div>
                  );
                })}
              </div>
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
                <span>{object.prise} ₽</span>
                <div className={cls.choiseblock}>
                  {object.choise.map((c, i) => {
                    const choise = i === 0 ? cls.ch : "";
                    return (
                      <div className={choise} key={c}>
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
              <span className={cls.desktopOnlyBreaks}>
                <br />
                <br />
                <br />
                <br />
              </span>
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
