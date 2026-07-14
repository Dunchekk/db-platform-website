import { create } from "zustand";
import {
  CheckoutItem,
  CheckoutItemsStore,
} from "@/shared/types/checkout.types";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCheckoutFormInputs } from "@/features/checkout/formData.store";

const resetDeliverySelection = () => {
  useCheckoutFormInputs.getState().resetDeliverySelection();
};

export const useCheckoutItems = create<CheckoutItemsStore>()(
  persist(
    (set, get) => ({
      items: [] as CheckoutItem[],
      addItem: (itemId) => {
        const items = get().items;
        const existing = items.find((item) => item.itemId === itemId);
        if (existing) {
          const updItems = items.map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );

          set({
            items: updItems,
          });
          resetDeliverySelection();
          return;
        }
        set({
          items: [...items, { itemId, quantity: 1 }],
        });
        resetDeliverySelection();
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
          resetDeliverySelection();
          return;
        }

        set({
          items: items.map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        });
        resetDeliverySelection();
      },
      clearItems: () => {
        set({ items: [] });
        resetDeliverySelection();
      },
      getAllQuantity: () => {
        const items = get().items;
        return items.reduce((quant, item) => {
          return quant + item.quantity;
        }, 0);
      },
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items, // partialize сохраняет только items, а не весь объект стора с функциями;
      }),
    }
  )
);
