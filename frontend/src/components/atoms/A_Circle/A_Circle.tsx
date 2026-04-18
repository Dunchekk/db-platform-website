import cls from "@/components/atoms/A_Circle/A_Circle.module.css";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";

const A_Circle = () => {
  const resetLayers = useLayersStore((state) => state.resetLayers);
  const isInfoLayerOpen = useLayersStore((state) =>
    state.openedLayers.includes("info")
  );
  const { pathname } = useLocation();
  const isAboutRoute = pathname === "/about";
  const shouldShiftPosition = isAboutRoute || isInfoLayerOpen;

  const [isLabelVisible, setIsLabelVisible] = useState(!shouldShiftPosition);
  const prevShiftRef = useRef(shouldShiftPosition);
  const hideTimeoutRef = useRef<number | null>(null);
  const showTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (shouldShiftPosition) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsLabelVisible(false);
        hideTimeoutRef.current = null;
      }, 0);
    } else if (prevShiftRef.current) {
      showTimeoutRef.current = window.setTimeout(() => {
        setIsLabelVisible(true);
        showTimeoutRef.current = null;
      }, 1000);
    } else {
      showTimeoutRef.current = window.setTimeout(() => {
        setIsLabelVisible(true);
        showTimeoutRef.current = null;
      }, 0);
    }

    prevShiftRef.current = shouldShiftPosition;
  }, [shouldShiftPosition]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (showTimeoutRef.current !== null) {
        window.clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      className={[cls.button, shouldShiftPosition ? cls.aboutopen : ""].join(
        " "
      )}
      type="button"
      aria-label="Go to About"
      disabled={shouldShiftPosition}
      onClick={shouldShiftPosition ? undefined : resetLayers}
    >
      <span
        className={cls.circle}
        data-q-circle-hit="true"
        aria-hidden="true"
      />
      <span
        className={[
          cls.label,
          isLabelVisible && !shouldShiftPosition ? cls.labelVisible : "",
        ].join(" ")}
      >
        db
      </span>
    </button>
  );
};

export default A_Circle;
