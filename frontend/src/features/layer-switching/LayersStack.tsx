// src/widgets/layers-stack/ui/LayersStack.tsx
import { LayerShell } from "@/layers/LayerShell";
import { useLayersStore } from "@/features/layer-switching/layers.store";
import { isBlurredLayer } from "@/features/layer-switching/get-layer-state";

import InfoLayer from "@/layers/InfoLayer/InfoLayer";
import AboutLayer from "@/layers/AboutLayer/AboutLayer";
import ObjectsLayer from "@/layers/ObjectsLayer/ObjectsLayer";
import CheckoutLayer from "@/layers/CheckoutLayer/CheckoutLayer";
import DetailsLayer from "@/layers/DetailsLayer/DetailsLayer";

export function LayersStack() {
  const openedLayers = useLayersStore((state) => state.openedLayers);

  const isObjectsOpen = openedLayers.includes("objects");
  const isDetailsOpen = openedLayers.includes("details");
  const isCheckoutOpen = openedLayers.includes("checkout");
  const isInfoOpen = openedLayers.includes("info");

  return (
    <>
      <AboutLayer />

      <LayerShell
        isOpen={isObjectsOpen}
        isBlurred={isBlurredLayer(openedLayers, "objects")}
        zIndex={20}
      >
        <ObjectsLayer />
      </LayerShell>

      <LayerShell
        isOpen={isDetailsOpen}
        isBlurred={isBlurredLayer(openedLayers, "details")}
        zIndex={30}
      >
        <DetailsLayer />
      </LayerShell>

      <LayerShell
        isOpen={isInfoOpen}
        isBlurred={isBlurredLayer(openedLayers, "info")}
        zIndex={30}
      >
        <InfoLayer />
      </LayerShell>

      <LayerShell
        isOpen={isCheckoutOpen}
        isBlurred={isBlurredLayer(openedLayers, "checkout")}
        zIndex={40}
      >
        <CheckoutLayer />
      </LayerShell>
    </>
  );
}
