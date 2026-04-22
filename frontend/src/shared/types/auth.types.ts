// features/auth/auth.types.ts — типы AuthUser, AuthStatus

export type AuthState = {
  isAuth: boolean;
  token: string | null;
  isAuthChecked: boolean;
  setIsAuthChecked: (value: boolean) => void;
  setIsAuth: (value: boolean) => void;
  setToken: (value: string | null) => void;
};

export type RequestOptions = RequestInit & {
  isAuth?: boolean;
};
