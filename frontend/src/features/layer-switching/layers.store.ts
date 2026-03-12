// src/features/layer-switching/model/layers.store.ts
import { create } from "zustand";
import type { OverlayLayerId } from "@/shared/types/layers";

type LayersState = {
  openedLayers: OverlayLayerId[];
  activeLayer: OverlayLayerId | null;

  openLayer: (layer: OverlayLayerId) => void;
  closeLayer: (layer: OverlayLayerId) => void;
  toggleLayer: (layer: OverlayLayerId) => void;
  setOpenedLayers: (layers: OverlayLayerId[]) => void;
  resetLayers: () => void;
};

export const useLayersStore = create<LayersState>((set, get) => ({
  openedLayers: [],
  activeLayer: null,

  openLayer: (layer) => {
    const opened = get().openedLayers;

    if (opened.includes(layer)) {
      set({ activeLayer: layer });
      return;
    }

    set({
      openedLayers: [...opened, layer],
      activeLayer: layer,
    });
  },

  closeLayer: (layer) => {
    const nextOpened = get().openedLayers.filter((item) => item !== layer);

    set({
      openedLayers: nextOpened,
      activeLayer: nextOpened[nextOpened.length - 1] ?? null,
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
    set({
      openedLayers: layers,
      activeLayer: layers[layers.length - 1] ?? null,
    });
  },

  resetLayers: () => {
    set({
      openedLayers: [],
      activeLayer: null,
    });
  },
}));
