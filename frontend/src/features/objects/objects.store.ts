// features/objects/objects.store.ts — глобальное auth-состояние

import { DbObject, ObjectsState } from "@/shared/types/object.types";
import { create } from "zustand";

export const useObjects = create<ObjectsState>((set) => ({
  objects: [
    // {
    //   id: 3,
    //   createdAt: "2026-04-10T10:25:11.000Z",
    //   updatedAt: "2026-04-10T10:25:11.000Z",
    //   name: "Leather Bag",
    //   price: 12900,
    //   order: 1,
    //   images: [
    //     {
    //       id: 7,
    //       url: "/uploads/3_bag-front.png",
    //       itemId: 3,
    //       position: 0,
    //     },
    //     {
    //       id: 8,
    //       url: "/uploads/3_bag-side.png",
    //       itemId: 3,
    //       position: 1,
    //     },
    //   ],
    //   points: [
    //     {
    //       id: 11,
    //       itemId: 3,
    //       point: "натуральная кожа",
    //     },
    //     {
    //       id: 12,
    //       itemId: 3,
    //       point: "ручная работа",
    //     },
    //   ],
    //   info: [
    //     {
    //       id: 21,
    //       itemId: 3,
    //       title: "Размер",
    //       description: "30x20 см",
    //     },
    //     {
    //       id: 22,
    //       itemId: 3,
    //       title: "Фурнитура",
    //       description: "металл",
    //     },
    //   ],
    // },
  ],
  setObjects: (objects: DbObject[]) => set({ objects }),
}));
