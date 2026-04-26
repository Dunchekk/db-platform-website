import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import cls from "@/layers/DetailsLayer/DetailsLayer.module.css";
import M_ImageSlider from "@/components/molecules/M_ImageSlider/M_ImageSlider";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useObjects } from "@/features/objects/objects.store";
import A_Button from "@/components/atoms/A_Button/A_Button";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useAuth } from "@/features/auth/auth.store";
import M_ItemModal from "@/components/molecules/M_ItemModal/M_ItemModal";
import M_PhotoesModal from "@/components/molecules/M_PhotoesModal/M_PhotoesModal";
import A_Toast from "@/components/atoms/A_Toast/A_Toast";

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
  const isAuth = useAuth((state) => state.isAuth);
  const [isChangeObjectModalOpen, openChangeObjectModal] =
    useState<boolean>(false);
  const [isChangePhotoesModalOpen, openChangePhotoesModal] =
    useState<boolean>(false);

  // добавить изменение "в корзину" если больше 1 объекта
  // переписать </br>

  const closeLayer = useLayersStore((state) => state.closeLayer);
  const object = useObjects((state) => state.objects).find(
    (v) => v.id === Number(id)
  );

  const thisItemInCheckout = useCheckoutItems((s) => s.items).find(
    (i) => i.itemId === Number(id)
  );
  const hasCheckoutItem = Boolean(thisItemInCheckout);

  const addToCard = useCheckoutItems((state) => state.addItem);
  const decreaseItem = useCheckoutItems((state) => state.decreaseItem);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // toast
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success" | "default">(
    "default"
  );
  const showToast = (
    message: string,
    type: "error" | "success" | "default"
  ) => {
    setToast(message);
    setToastType(type);
  };
  // toast

  const API_URL = __API_URL__;

  const images = useMemo(() => {
    if (!object) return [];
    if (Array.isArray(object.images) && object.images.length > 0)
      return [...object.images]
        .sort((a, b) => a.position - b.position)
        .map((v) => API_URL + v.url);
    return [];
  }, [object, API_URL]);

  console.log(isChangePhotoesModalOpen); //убрать

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

            {isAuth ? (
              <A_Button
                onClick={() => openChangePhotoesModal(true)}
                className={[cls.photo].join(" ")}
              >
                изменить фото
              </A_Button>
            ) : null}

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
              {!isAuth ? (
                <>
                  {hasCheckoutItem ? (
                    <div className={cls.buttons}>
                      <A_Button
                        type="button"
                        onClick={() => decreaseItem(thisItemInCheckout.itemId)}
                      >
                        —
                      </A_Button>
                      <span>{thisItemInCheckout.quantity}</span>
                      <A_Button
                        type="button"
                        onClick={() => addToCard(thisItemInCheckout.itemId)}
                      >
                        +
                      </A_Button>
                    </div>
                  ) : (
                    <A_Button
                      onClick={() => addToCard(object.id)}
                      className={[cls.tocard, cls.desktopTocard].join(" ")}
                    >
                      + в корзину
                    </A_Button>
                  )}
                </>
              ) : (
                <A_Button
                  onClick={() => openChangeObjectModal(true)}
                  className={[cls.tocard, cls.desktopTocard].join(" ")}
                >
                  изменить
                </A_Button>
              )}
            </div>
          </div>

          /* ------------------- */
        )}
        {isAuth && object ? (
          <M_ItemModal
            className={cls.modal}
            objectId={Number(effectiveObjectId)}
            showToast={showToast}
            hidden={!isChangeObjectModalOpen}
            key={object.id}
            setIsModuleOpen={openChangeObjectModal}
          />
        ) : null}

        {isAuth && object ? (
          <M_PhotoesModal
            className={cls.modal}
            objectId={Number(effectiveObjectId)}
            hidden={!isChangePhotoesModalOpen}
            key={object.id}
            setIsModuleOpen={openChangePhotoesModal}
          />
        ) : null}
      </div>
      {toast ? (
        <A_Toast
          type={toastType}
          message={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
};

export default DetailsLayer;
