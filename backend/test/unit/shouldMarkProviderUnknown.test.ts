import { describe, expect, test } from "vitest";
import { shouldMarkProviderUnknown } from "../../src/helpers/shouldMarkProviderUnknown";

describe("shouldMarkProviderUnknown", () => {
  test.each([
    "Request timeout",
    "Network error",
    "Socket hang up",
    "ECONNRESET",
    "ETIMEDOUT",
    "Provider returned 502",
    "Provider returned 503",
    "Provider returned 504",
  ])("возвращает true для неясной сетевой ошибки: %j", (message) => {
    expect(shouldMarkProviderUnknown(new Error(message))).toBe(true);
  });

  test.each([
    "Validation failed",
    "Payment was rejected",
    "Provider returned 400",
    "Provider returned 401",
    "Provider returned 404",
  ])("возвращает false для понятной ошибки: %j", (message) => {
    expect(shouldMarkProviderUnknown(new Error(message))).toBe(false);
  });

  test.each([undefined, null, "", "timeout", 502, {}, []])(
    "возвращает false, если значение не Error: %j",
    (value) => {
      expect(shouldMarkProviderUnknown(value)).toBe(false);
    }
  );
});
