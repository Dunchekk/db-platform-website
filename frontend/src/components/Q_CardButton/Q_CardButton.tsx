import cls from "@/components/Q_CardButton/Q_CardButton.module.css";
import { useLayersStore } from "@/features/layer-switching/layers.store";

const Q_CardButton = () => {
  const toggleLayer = useLayersStore((state) => state.toggleLayer);
  const isCheckoutOpen = useLayersStore((state) =>
    state.openedLayers.includes("checkout")
  );

  const count = 0;

  return (
    <button
      type="button"
      className={[cls.wrapper, isCheckoutOpen ? cls.open : ""].join(" ")}
      onClick={() => toggleLayer("checkout")}
      aria-label="Открыть корзину"
      aria-expanded={isCheckoutOpen}
    >
      <span className={cls.icon} aria-hidden="true" />
      <span className={cls.count}>({count})</span>
    </button>
  );
};

export default Q_CardButton;
