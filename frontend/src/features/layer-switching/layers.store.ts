// src/features/layer-switching/model/layers.store.ts
import { create } from "zustand";
import type { OverlayLayerId } from "@/shared/types/layers";

const LAYER_ORDER: OverlayLayerId[] = ["objects", "details", "info", "checkout"];

function normalizeOpenedLayers(
  layers: OverlayLayerId[],
  activeObjectId: string | null
): { openedLayers: OverlayLayerId[]; activeObjectId: string | null } {
  const uniqueLayers = Array.from(new Set(layers));
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

  // Details require an active object id.
  if (next.includes("details") && !activeObjectId) {
    next = next.filter((layer) => layer !== "details");
  }

  // Any overlay except "objects" implies "objects".
  const hasAnyOverlay = next.length > 0;
  const hasNonObjectsOverlay = next.some((layer) => layer !== "objects");
  if (hasAnyOverlay && hasNonObjectsOverlay && !next.includes("objects")) {
    next = [...next, "objects"];
  }

  // If "objects" is closed, everything above it must be closed.
  if (!next.includes("objects")) {
    next = [];
  }

  const openedLayers = LAYER_ORDER.filter((layer) => next.includes(layer));
  const nextActiveObjectId = openedLayers.includes("details") ? activeObjectId : null;

  return { openedLayers, activeObjectId: nextActiveObjectId };
}

type LayersState = {
  openedLayers: OverlayLayerId[];
  activeLayer: OverlayLayerId | null;
  activeObjectId: string | null;

  openLayer: (layer: OverlayLayerId) => void;
  closeLayer: (layer: OverlayLayerId) => void;
  toggleLayer: (layer: OverlayLayerId) => void;
  setOpenedLayers: (layers: OverlayLayerId[]) => void;
  setActiveObjectId: (objectId: string | null) => void;
  setRouteState: (params: {
    openedLayers: OverlayLayerId[];
    activeObjectId: string | null;
  }) => void;
  resetLayers: () => void;
};

export const useLayersStore = create<LayersState>((set, get) => ({
  openedLayers: [],
  activeLayer: null,
  activeObjectId: null,

  openLayer: (layer) => {
    const opened = get().openedLayers;

    if (opened.includes(layer)) {
      set({ activeLayer: layer });
      return;
    }

    const normalized = normalizeOpenedLayers(
      [...opened, layer],
      get().activeObjectId
    );

    set({
      openedLayers: normalized.openedLayers,
      activeLayer: normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
    });
  },

  closeLayer: (layer) => {
    const openedLayers = get().openedLayers;
    const nextOpened = openedLayers.filter((item) => item !== layer);

    const nextActiveObjectId =
      layer === "details" || layer === "objects" ? null : get().activeObjectId;

    const normalized = normalizeOpenedLayers(nextOpened, nextActiveObjectId);

    set({
      openedLayers: normalized.openedLayers,
      activeLayer: normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
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
    const normalized = normalizeOpenedLayers(layers, get().activeObjectId);

    set({
      openedLayers: normalized.openedLayers,
      activeLayer: normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
    });
  },

  setActiveObjectId: (objectId) => {
    const normalized = normalizeOpenedLayers(get().openedLayers, objectId);

    set({
      openedLayers: normalized.openedLayers,
      activeLayer: normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
    });
  },

  setRouteState: ({ openedLayers, activeObjectId }) => {
    const normalized = normalizeOpenedLayers(openedLayers, activeObjectId);

    set({
      openedLayers: normalized.openedLayers,
      activeLayer: normalized.openedLayers[normalized.openedLayers.length - 1] ?? null,
      activeObjectId: normalized.activeObjectId,
    });
  },

  resetLayers: () => {
    set({
      openedLayers: [],
      activeLayer: null,
      activeObjectId: null,
    });
  },
}));
