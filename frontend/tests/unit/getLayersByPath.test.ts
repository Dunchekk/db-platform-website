import { describe, expect, test } from "vitest";
import { getLayersByPath } from "../../src/features/layer-switching/getLayersByPath";

describe("getLayersByPath", () => {
  test.each([
    ["/about", ["about"]],
    ["/", ["about", "objects"]],
    ["/checkout", ["about", "objects", "checkout"]],
    ["/info", ["about", "objects", "info"]],
    ["/info/privacy", ["about", "objects", "info"]],
    ["/object/12", ["about", "objects", "details"]],
    ["/object/12/checkout", ["about", "objects", "details", "checkout"]],
  ])("возвращает слои для пути %j", (pathname, expected) => {
    expect(getLayersByPath(pathname)).toEqual(expected);
  });

  test.each(["/unknown", "/object", "/object/12/extra", "/info/a/b"])(
    "возвращает базовые слои для неизвестного пути %j",
    (pathname) => {
      expect(getLayersByPath(pathname)).toEqual(["about", "objects"]);
    }
  );
});
