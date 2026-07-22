import ApiError from "../error/ApiError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\-()\s]+$/;
const RUSSIAN_PHONE_REGEX = /^\+7\d{10}$/;

export const validateRequiredString = (
  value: string | undefined,
  fieldName: string
): string => {
  const normalized = value?.trim();

  if (!normalized) {
    throw ApiError.badRequest(`${fieldName} is required`);
  }

  return normalized;
};

export const validatePositiveInteger = (
  value: unknown,
  fieldName: string
): number => {
  const parsed =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (typeof parsed !== "number" || !Number.isInteger(parsed)) {
    throw ApiError.badRequest(`${fieldName} must be an integer`);
  }

  if (parsed <= 0) {
    throw ApiError.badRequest(`${fieldName} must be greater than 0`);
  }

  return parsed;
};

export const validateEmail = (email: string | undefined): string => {
  const normalized = validateRequiredString(email, "Email").toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throw ApiError.badRequest("Email format is invalid");
  }

  return normalized;
};

export const validatePhone = (phone: string | undefined): string => {
  const normalized = validateRequiredString(phone, "Phone");

  if (!PHONE_REGEX.test(normalized)) {
    throw ApiError.badRequest("Phone contains invalid characters");
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  let cdekPhone: string;

  if (digitsOnly.length === 10) {
    cdekPhone = `+7${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("8")) {
    cdekPhone = `+7${digitsOnly.slice(1)}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("7")) {
    cdekPhone = `+${digitsOnly}`;
  } else {
    throw ApiError.badRequest("Phone format is invalid");
  }

  if (!RUSSIAN_PHONE_REGEX.test(cdekPhone)) {
    throw ApiError.badRequest("Phone format is invalid");
  }

  return cdekPhone;
};
