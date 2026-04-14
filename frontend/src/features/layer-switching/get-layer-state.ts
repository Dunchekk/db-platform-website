import type { OverlayLayerId } from "@/shared/types/layers.types";

export function isTopLayer(
  openedLayers: OverlayLayerId[],
  layer: OverlayLayerId
): boolean {
  return openedLayers[openedLayers.length - 1] === layer;
}

export function isOpenedLayer(
  openedLayers: OverlayLayerId[],
  layer: OverlayLayerId
): boolean {
  return openedLayers.includes(layer);
}

export function isBlurredLayer(
  openedLayers: OverlayLayerId[],
  layer: OverlayLayerId
): boolean {
  return isOpenedLayer(openedLayers, layer) && !isTopLayer(openedLayers, layer);
}
