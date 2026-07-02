import ApiError from "../error/ApiError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\-()\s]+$/;

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

  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    throw ApiError.badRequest("Phone format is invalid");
  }

  return normalized;
};
