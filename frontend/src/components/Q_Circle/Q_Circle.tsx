import cls from "@/components/Q_Circle/Q_Circle.module.css";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useLocation } from "react-router";

const Q_Circle = () => {
  const resetLayers = useLayersStore((state) => state.resetLayers);
  const isInfoLayerOpen = useLayersStore((state) =>
    state.openedLayers.includes("info")
  );
  const { pathname } = useLocation();
  const isAboutRoute = pathname === "/about";
  const shouldShiftPosition = isAboutRoute || isInfoLayerOpen;

  return (
    <button
      className={[cls.circle, shouldShiftPosition ? cls.aboutopen : ""].join(
        " "
      )}
      type="button"
      aria-label="Go to About"
      disabled={shouldShiftPosition}
      onClick={shouldShiftPosition ? undefined : resetLayers}
    />
  );
};

export default Q_Circle;
