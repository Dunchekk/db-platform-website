// shared/api/auth.ts — login, checkSession

import { $authHost, $host } from ".";
import { AUTH_LOGIN_URL, AUTH_SESSION_URL } from "./endpoints";

export const login = async (email: string, password: string) => {
  const response = await $host.post(AUTH_LOGIN_URL, { email, password });
  localStorage.setItem("token", response.token);

  return response;
};

export const logout = async () => {
  localStorage.removeItem("token");
  return;
};

export const check = async () => {
  const response = await $authHost.get(AUTH_SESSION_URL);
  return response;
};
