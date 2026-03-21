import cls from "@/components/Q_Circle/Q_Circle.module.css";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";

const Q_Circle = () => {
  const resetLayers = useLayersStore((state) => state.resetLayers);
  const isInfoLayerOpen = useLayersStore((state) =>
    state.openedLayers.includes("info")
  );
  const { pathname } = useLocation();
  const isAboutRoute = pathname === "/about";
  const shouldShiftPosition = isAboutRoute || isInfoLayerOpen;

  const [isLabelVisible, setIsLabelVisible] = useState(!shouldShiftPosition);
  const prevShiftRef = useRef(shouldShiftPosition);
  const showTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (shouldShiftPosition) {
      setIsLabelVisible(false);
    } else if (prevShiftRef.current) {
      showTimeoutRef.current = window.setTimeout(() => {
        setIsLabelVisible(true);
        showTimeoutRef.current = null;
      }, 1000);
    } else {
      setIsLabelVisible(true);
    }

    prevShiftRef.current = shouldShiftPosition;
  }, [shouldShiftPosition]);

  useEffect(() => {
    return () => {
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
        className={[cls.label, isLabelVisible ? cls.labelVisible : ""].join(
          " "
        )}
      >
        db
      </span>
    </button>
  );
};

export default Q_Circle;
