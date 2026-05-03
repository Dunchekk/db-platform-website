import "dotenv/config";
import { URLSearchParams } from "node:url";

type CdekTokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  scope?: string;
};

type CdekTokenResponseError = {
  error: string;
  error_description: string;
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const CDEK_BASE_URL = process.env.CDEK_BASE_URL as string;
const CDEK_CLIENT_ID = process.env.CDEK_CLIENT_ID as string;
const CDEK_CLIENT_SECRET = process.env.CDEK_CLIENT_SECRET as string;

export async function getCdekToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CDEK_CLIENT_ID,
    client_secret: CDEK_CLIENT_SECRET,
  });

  const response = await fetch(`${CDEK_BASE_URL}/oauth/token`, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const text = response.text();
    const { error_description } =
      (await response.json()) as CdekTokenResponseError;
    throw new Error(`CDEK auth failed: ${error_description} ${text}`);
  }

  const data = (await response.json()) as CdekTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}
