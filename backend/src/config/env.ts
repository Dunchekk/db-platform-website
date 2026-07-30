import dotenv from "dotenv";

dotenv.config();

// backend preflight: все энвы для бека + воркера (пользуется этими же)

const requiredEnvNames = [
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "JWT_SECRET",
  "CORS_ORIGINS",
  "YOUKASSA_WEBHOOK_SECRET",
  "SHOP_ID",
  "YOUKASSA_SECRET_KEY",
  "FRONTEND_RETURN_URL",
  "CDEK_BASE_URL",
  "CDEK_CLIENT_ID",
  "CDEK_CLIENT_SECRET",
  "CDEK_COUNTRY_CODE",
  "CDEK_FROM_CITY_CODE",
  "CDEK_TARIFF_CODE",
  "CDEK_SELLER_NAME",
  "CDEK_SELLER_INN",
  "CDEK_SELLER_PHONE",
  "CDEK_SELLER_OWNERSHIP_FORM",
  "CDEK_SHIPMENT_POINT",
  "MAIL_USER",
  "MAIL_APP_PASSWORD",
] as const;

type RequiredEnvName = (typeof requiredEnvNames)[number];
type BackendEnv = Record<RequiredEnvName, string> & {
  PORT: string;
};

function readRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

export const env: BackendEnv = {
  ...Object.fromEntries(
    requiredEnvNames.map((name) => [name, readRequiredEnv(name)])
  ),
  PORT: process.env.PORT || "5000",
} as BackendEnv;
