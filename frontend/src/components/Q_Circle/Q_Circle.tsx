import cls from "@/components/Q_Circle/Q_Circle.module.css";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { useLocation } from "react-router";

const Q_Circle = () => {
  const resetLayers = useLayersStore((state) => state.resetLayers);
  const { pathname } = useLocation();
  const isAboutRoute = pathname === "/about";

  return (
    <button
      className={[cls.circle, isAboutRoute ? cls.aboutopen : ""].join(" ")}
      type="button"
      aria-label="Go to About"
      onClick={resetLayers}
    />
  );
};

export default Q_Circle;
