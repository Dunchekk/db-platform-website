import { describe, expect, test } from "vitest";
import {
  validateEmail,
  validatePhone,
  validatePositiveInteger,
  validateRequiredString,
} from "../../src/helpers/validation";

describe("validateRequiredString", () => {
  test("возвращает непустую строку", () => {
    expect(validateRequiredString("Dunchek", "Name")).toBe("Dunchek");
  });

  test("удаляет пробелы по краям строки", () => {
    expect(validateRequiredString("   Dunchek   ", "Name")).toBe("Dunchek");
  });

  test.each([undefined, "", "   "])(
    "выбрасывает ошибку для пустого значения: %s",
    (value) => {
      expect(() => validateRequiredString(value, "Name")).toThrow(
        "Name is required"
      );
    }
  );

  test("подставляет название поля в сообщение ошибки", () => {
    expect(() => validateRequiredString(undefined, "Phone")).toThrow(
      "Phone is required"
    );
  });
});

describe("validatePhone", () => {
  describe("корректные номера", () => {
    test.each([
      ["9991234567", "+79991234567"],
      ["89991234567", "+79991234567"],
      ["79991234567", "+79991234567"],
    ])("преобразует %s в %s", (input, expected) => {
      expect(validatePhone(input)).toBe(expected);
    });
  });

  describe("некорректные номера", () => {
    test("выбрасывает ошибку, если номер не передан", () => {
      expect(() => validatePhone(undefined)).toThrow();
    });

    test.each(["8999abc4567", "8999@123456", "phone"])(
      "выбрасывает ошибку при запрещённых символах: %s",
      (input) => {
        expect(() => validatePhone(input)).toThrow(
          "Phone contains invalid characters"
        );
      }
    );

    test.each(["12345", "69991234567", "799912345678"])(
      "выбрасывает ошибку при неправильном формате: %s",
      (input) => {
        expect(() => validatePhone(input)).toThrow("Phone format is invalid");
      }
    );
  });
});

describe("validatePositiveInteger", () => {
  test.each([
    [1, 1],
    [10, 10],
    ["1", 1],
    ["42", 42],
    ["  42  ", 42],
  ])("преобразует %j в положительное целое %d", (value, expected) => {
    expect(validatePositiveInteger(value, "Quantity")).toBe(expected);
  });

  test.each([
    undefined,
    null,
    true,
    false,
    {},
    [],
    "",
    "   ",
    "hello",
    1.5,
    "1.5",
    NaN,
    Infinity,
    -Infinity,
  ])("отклоняет значение, не являющееся целым: %j", (value) => {
    expect(() => validatePositiveInteger(value, "Quantity")).toThrow(
      "Quantity must be an integer"
    );
  });

  test.each([0, -1, -100, "0", "-1"])(
    "отклоняет целое число не больше нуля: %j",
    (value) => {
      expect(() => validatePositiveInteger(value, "Quantity")).toThrow(
        "Quantity must be greater than 0"
      );
    }
  );

  test("подставляет название поля в сообщение ошибки", () => {
    expect(() => validatePositiveInteger("abc", "Page")).toThrow(
      "Page must be an integer"
    );
  });
});

describe("validateEmail", () => {
  test.each([
    ["test@example.com", "test@example.com"],
    ["TEST@EXAMPLE.COM", "test@example.com"],
    ["  TEST@EXAMPLE.COM  ", "test@example.com"],
  ])("нормализует %j в %j", (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });

  test.each([undefined, "", "   "])(
    "отклоняет отсутствующий email: %j",
    (email) => {
      expect(() => validateEmail(email)).toThrow("Email is required");
    }
  );

  test.each([
    "plainaddress",
    "@example.com",
    "user@",
    "user example@example.com",
  ])("отклоняет email неправильного формата: %j", (email) => {
    expect(() => validateEmail(email)).toThrow("Email format is invalid");
  });
});
