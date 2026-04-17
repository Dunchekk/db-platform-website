import { create } from "zustand";
import { CheckoutItemsStore } from "@/shared/types/checkout.types";

export const useCheckoutItems = create<CheckoutItemsStore>((set, get) => ({
  items: [],
  addItem: (itemId) => {
    const items = get().items;
    const existing = items.find((item) => item.itemId === itemId);
    if (existing) {
      const updItems = items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );

      set({
        items: updItems,
      });
      return;
    }
    set({
      items: [...items, { itemId, quantity: 1 }],
    });
  },
  decreaseItem: (itemId) => {
    const items = get().items;
    const existing = items.find((item) => item.itemId === itemId);

    if (!existing) {
      return;
    }

    if (existing.quantity === 1) {
      set({
        items: items.filter((item) => item.itemId !== itemId),
      });
      return;
    }

    set({
      items: items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item
      ),
    });
  },
  clearItems: () => {
    set({ items: [] });
  },
  getAllQuantity: () => {
    const items = get().items;
    return items.reduce((quant, item) => {
      return quant + item.quantity;
    }, 0);
  },
}));
