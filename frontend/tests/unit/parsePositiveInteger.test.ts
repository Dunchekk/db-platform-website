import { describe, expect, test } from "vitest";
import { parsePositiveInteger } from "../../src/shared/helpers/parsePositiveInteger";

describe("parsePositiveInteger", () => {
  test.each([
    ["1", 1],
    ["42", 42],
    [" 7 ", 7],
  ])("возвращает положительное целое число из %j", (value, expected) => {
    expect(parsePositiveInteger(value)).toBe(expected);
  });

  test.each(["", " ", "0", "-1", "1.5", "abc"])(
    "возвращает null для невалидного значения %j",
    (value) => {
      expect(parsePositiveInteger(value)).toBeNull();
    }
  );
});
