import cls from "@/components/atoms/A_CardButton/A_CardButton.module.css";
import { useCheckoutItems } from "@/features/checkout/checkout.store";
import { useLayersStore } from "@/features/layer-switching/layers.store";

const A_CardButton = () => {
  const toggleLayer = useLayersStore((state) => state.toggleLayer);
  const isCheckoutOpen = useLayersStore((state) =>
    state.openedLayers.includes("checkout")
  );

  const totalQuantity = useCheckoutItems((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <button
      type="button"
      className={[cls.wrapper, isCheckoutOpen ? cls.open : ""].join(" ")}
      onClick={() => toggleLayer("checkout")}
      aria-label="Открыть корзину"
      aria-expanded={isCheckoutOpen}
    >
      <span className={cls.icon} aria-hidden="true" />
      <span className={cls.count}>({totalQuantity})</span>
    </button>
  );
};

export default A_CardButton;
