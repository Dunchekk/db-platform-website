import { describe, expect, test } from "vitest";
import { mapYooKassaStatus } from "../../src/helpers/mapYooKassaStatus";

describe("mapYooKassaStatus", () => {
  test.each([
    ["waiting_for_capture", "PENDING"],
    ["payment.waiting_for_capture", "PENDING"],
    ["pending", "PENDING"],
    ["succeeded", "SUCCEEDED"],
    ["payment.succeeded", "SUCCEEDED"],
    ["canceled", "CANCELED"],
    ["payment.canceled", "CANCELED"],
  ])("преобразует статус YooKassa %j в локальный статус %j", (input, expected) => {
    expect(mapYooKassaStatus(input)).toBe(expected);
  });

  test.each(["unknown", "", "failed", "payment.pending"])(
    "возвращает PENDING для неизвестного статуса: %j",
    (input) => {
      expect(mapYooKassaStatus(input)).toBe("PENDING");
    }
  );
});
