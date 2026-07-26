import { describe, expect, test } from "vitest";
import { buildCdekPackagesFromOrderItems } from "../../src/services/helpers/buildCdekPackagesFromOrderItems";

describe("buildCdekPackagesFromOrderItems", () => {
  test("возвращает пустой массив, если товаров нет", () => {
    expect(buildCdekPackagesFromOrderItems([])).toEqual([]);
  });

  test("создаёт одну посылку для товара с quantity 1", () => {
    expect(
      buildCdekPackagesFromOrderItems([
        {
          quantity: 1,
          packageWeightGrams: 500,
          packageLengthCm: 20,
          packageWidthCm: 10,
          packageHeightCm: 5,
        },
      ])
    ).toEqual([
      {
        weight: 500,
        length: 20,
        width: 10,
        height: 5,
      },
    ]);
  });

  test("создаёт отдельную посылку на каждую единицу quantity", () => {
    expect(
      buildCdekPackagesFromOrderItems([
        {
          quantity: 3,
          packageWeightGrams: 1200,
          packageLengthCm: 30,
          packageWidthCm: 20,
          packageHeightCm: 10,
        },
      ])
    ).toEqual([
      {
        weight: 1200,
        length: 30,
        width: 20,
        height: 10,
      },
      {
        weight: 1200,
        length: 30,
        width: 20,
        height: 10,
      },
      {
        weight: 1200,
        length: 30,
        width: 20,
        height: 10,
      },
    ]);
  });

  test("сохраняет размеры разных товаров в правильном порядке", () => {
    expect(
      buildCdekPackagesFromOrderItems([
        {
          quantity: 2,
          packageWeightGrams: 300,
          packageLengthCm: 15,
          packageWidthCm: 10,
          packageHeightCm: 4,
        },
        {
          quantity: 1,
          packageWeightGrams: 900,
          packageLengthCm: 40,
          packageWidthCm: 25,
          packageHeightCm: 12,
        },
      ])
    ).toEqual([
      {
        weight: 300,
        length: 15,
        width: 10,
        height: 4,
      },
      {
        weight: 300,
        length: 15,
        width: 10,
        height: 4,
      },
      {
        weight: 900,
        length: 40,
        width: 25,
        height: 12,
      },
    ]);
  });
});
