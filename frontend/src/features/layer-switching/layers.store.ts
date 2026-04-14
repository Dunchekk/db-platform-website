// src/features/layer-switching/model/layers.store.ts
import { create } from "zustand";
import type { OverlayLayerId } from "@/shared/types/layers.types";
import {
  DEFAULT_INFO_SECTION,
  type InfoSectionId,
} from "@/shared/types/info.types";

const LAYER_ORDER: OverlayLayerId[] = [
  "about",
  "objects",
  "details",
  "info",
  "checkout",
];

function normalizeOpenedLayers(
  layers: OverlayLayerId[],
  activeObjectId: string | null,
  activeInfoSection: InfoSectionId | null
): {
  openedLayers: OverlayLayerId[];
  activeObjectId: string | null;
  activeInfoSection: InfoSectionId | null;
} {
  const withAbout = layers.includes("about") ? layers : ["about", ...layers];
  const uniqueLayers = Array.from(new Set(withAbout));
  const lastIndex = (layer: OverlayLayerId) => layers.lastIndexOf(layer);

  // Resolve conflicts: "info" is exclusive with "details" and "checkout".
  let next = uniqueLayers;
  const hasInfo = next.includes("info");
  const hasDetails = next.includes("details");
  const hasCheckout = next.includes("checkout");

  if (hasCheckout && hasInfo) {
    next = next.filter((layer) => layer !== "info");
  } else if (hasInfo && hasDetails) {
    const keepInfo = lastIndex("info") > lastIndex("details");
    next = next.filter((layer) =>
      layer === "info" ? keepInfo : layer === "details" ? !keepInfo : true
    );
  }

  const hasObjects = next.includes("objects");

  // Details require an active object id.
  if (next.includes("details") && !activeObjectId) {
    next = next.filter((layer) => layer !== "details");
  }

  // Any layer above "objects" implies "objects".
  const needsObjects = next.some(
    (layer) => layer === "details" || layer === "info" || layer === "checkout"
  );
  if (needsObjects && !hasObjects) {
    next = [...next, "objects"];
  }

  // If "objects" is closed, everything above it must be closed (keeping "about").
  if (!next.includes("objects")) {
    next = ["about"];
  }

  const openedLayers = LAYER_ORDER.filter((layer) => next.includes(layer));
  const nextActiveObjectId = openedLayers.includes("objects")
    ? activeObjectId
    : null;

  const nextActiveInfoSection = openedLayers.includes("objects")
    ? openedLayers.includes("info")
      ? (activeInfoSection ?? DEFAULT_INFO_SECTION)
      : activeInfoSection
    : null;

  return {
    openedLayers,
    activeObjectId: nextActiveObjectId,
    activeInfoSection: nextActiveInfoSection,
  };
}

type LayersState = {
  openedLayers: OverlayLayerId[];
  activeLayer: OverlayLayerId | null;
  activeObjectId: string | null;
  lastActiveObjectId: string | null;
  activeInfoSection: InfoSectionId | null;

  openLayer: (layer: OverlayLayerId) => void;
  closeLayer: (layer: OverlayLayerId) => void;
  toggleLayer: (layer: OverlayLayerId) => void;
  setOpenedLayers: (layers: OverlayLayerId[]) => void;
  setActiveObjectId: (objectId: string | null) => void;
  setActiveInfoSection: (section: InfoSectionId) => void;
  setRouteState: (params: {
    openedLayers: OverlayLayerId[];
    activeObjectId: string | null;
    activeInfoSection: InfoSectionId | null;
  }) => void;
  resetLayers: () => void;
};

export const useLayersStore = create<LayersState>((set, get) => ({
  openedLayers: ["about"],
  activeLayer: null,
  activeObjectId: null,
  lastActiveObjectId: null,
  activeInfoSection: null,

  openLayer: (layer) => {
    const opened = get().openedLayers;

    if (opened.includes(layer)) {
      set({ activeLayer: layer });
      return;
    }

    const normalized = normalizeOpenedLayers(
      [...opened, layer],
      get().activeObjectId,
      get().activeInfoSection
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer:
        normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
      activeInfoSection: normalized.activeInfoSection,
      lastActiveObjectId: normalized.activeObjectId ?? get().lastActiveObjectId,
    });
  },

  closeLayer: (layer) => {
    const openedLayers = get().openedLayers;
    const nextOpened = openedLayers.filter((item) => item !== layer);

    const nextActiveObjectId =
      layer === "objects" ? null : get().activeObjectId;

    const normalized = normalizeOpenedLayers(
      nextOpened,
      nextActiveObjectId,
      layer === "info" ? null : get().activeInfoSection
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer:
        normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
      activeInfoSection: normalized.activeInfoSection,
      lastActiveObjectId: normalized.activeObjectId ?? get().lastActiveObjectId,
    });
  },

  toggleLayer: (layer) => {
    const isOpened = get().openedLayers.includes(layer);

    if (isOpened) {
      get().closeLayer(layer);
      return;
    }

    get().openLayer(layer);
  },

  setOpenedLayers: (layers) => {
    const normalized = normalizeOpenedLayers(
      layers,
      get().activeObjectId,
      layers.includes("info") ? get().activeInfoSection : null
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer:
        normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
      activeInfoSection: normalized.activeInfoSection,
      lastActiveObjectId: normalized.activeObjectId ?? get().lastActiveObjectId,
    });
  },

  setActiveObjectId: (objectId) => {
    const normalized = normalizeOpenedLayers(
      get().openedLayers,
      objectId,
      get().activeInfoSection
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer:
        normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
      activeInfoSection: normalized.activeInfoSection,
      lastActiveObjectId: objectId ?? get().lastActiveObjectId,
    });
  },

  setActiveInfoSection: (section) => {
    set({ activeInfoSection: section });
  },

  setRouteState: ({ openedLayers, activeObjectId, activeInfoSection }) => {
    const normalized = normalizeOpenedLayers(
      openedLayers,
      activeObjectId,
      openedLayers.includes("info") ? activeInfoSection : null
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer:
        normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
      activeInfoSection: normalized.activeInfoSection,
      lastActiveObjectId: activeObjectId ?? get().lastActiveObjectId,
    });
  },

  resetLayers: () => {
    set({
      openedLayers: ["about"],
      activeLayer: null,
      activeObjectId: null,
      activeInfoSection: null,
    });
  },
}));
