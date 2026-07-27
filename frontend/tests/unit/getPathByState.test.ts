import { describe, expect, test } from "vitest";
import { getPathByState } from "@/features/layer-switching/getPathByState";
import type { GetPathByStateParams } from "@/features/layer-switching/getPathByState";

describe("getPathByState", () => {
  test.each([
    [
      "нет открытых слоёв",
      {
        openedLayers: [],
        activeObjectId: null,
        activeInfoSection: null,
      },
      "/about",
    ],
    [
      "нет слоя about",
      {
        openedLayers: ["objects"],
        activeObjectId: null,
        activeInfoSection: null,
      },
      "/about",
    ],
    [
      "нет слоя objects",
      {
        openedLayers: ["about", "info"],
        activeObjectId: null,
        activeInfoSection: "contacts",
      },
      "/about",
    ],
    [
      "открыты about и objects",
      {
        openedLayers: ["about", "objects"],
        activeObjectId: null,
        activeInfoSection: null,
      },
      "/",
    ],
    [
      "открыта карточка объекта",
      {
        openedLayers: ["about", "objects", "details"],
        activeObjectId: "2",
        activeInfoSection: null,
      },
      "/object/2",
    ],
    [
      "открыта карточка объекта и checkout",
      {
        openedLayers: ["about", "objects", "details", "checkout"],
        activeObjectId: "2",
        activeInfoSection: null,
      },
      "/object/2/checkout",
    ],
    [
      "открыт checkout без карточки объекта",
      {
        openedLayers: ["about", "objects", "checkout"],
        activeObjectId: null,
        activeInfoSection: null,
      },
      "/checkout",
    ],
    [
      "открыт info с выбранным разделом",
      {
        openedLayers: ["about", "objects", "info"],
        activeObjectId: null,
        activeInfoSection: "delivery",
      },
      "/info/delivery",
    ],
    [
      "открыт info без выбранного раздела",
      {
        openedLayers: ["about", "objects", "info"],
        activeObjectId: null,
        activeInfoSection: null,
      },
      "/info/contacts",
    ],
  ])("возвращает путь: %s", (_, params, expected) => {
    expect(getPathByState(params as GetPathByStateParams)).toBe(expected);
  });
});
