import { env } from "../config/env";

export function requiredEnv(name: keyof typeof env): string {
  return env[name];
}
