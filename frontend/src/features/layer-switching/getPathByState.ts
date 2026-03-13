// src/features/layer-switching/model/getPathByState.ts
import type { OverlayLayerId } from "@/shared/types/layers";

type GetPathByStateParams = {
  openedLayers: OverlayLayerId[];
  activeObjectId: string | null;
};

export function getPathByState({
  openedLayers,
  activeObjectId,
}: GetPathByStateParams): string {
  if (openedLayers.length === 0) {
    return "/about";
  }

  const hasAbout = openedLayers.includes("about");
  if (!hasAbout) {
    return "/about";
  }

  const hasObjects = openedLayers.includes("objects");
  const hasDetails = openedLayers.includes("details");
  const hasCheckout = openedLayers.includes("checkout");
  const hasInfo = openedLayers.includes("info");

  if (!hasObjects) {
    return "/about";
  }

  if (hasDetails && activeObjectId) {
    if (hasCheckout) {
      return `/object/${activeObjectId}/checkout`;
    }

    return `/object/${activeObjectId}`;
  }

  if (hasInfo) {
    return "/info";
  }

  if (hasCheckout) {
    return "/checkout";
  }

  return "/";
}
