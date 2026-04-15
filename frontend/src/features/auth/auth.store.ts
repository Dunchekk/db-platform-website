// features/auth/auth.store.ts — глобальное auth-состояние

import { create } from "zustand";
import { AuthState } from "../../shared/types/auth.types";

export const useAuth = create<AuthState>((set) => ({
  isAuth: false,
  token: null,
  setIsAuth: (bool: boolean) => set({ isAuth: bool }),
  setToken: (tok: string | null) => set({ token: tok }),
}));
