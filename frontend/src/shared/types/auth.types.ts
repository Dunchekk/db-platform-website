// features/auth/auth.types.ts — типы AuthUser, AuthStatus

export type AuthState = {
  isAuth: boolean;
  token: string | null;
  setIsAuth: (value: boolean) => void;
  setToken: (value: string | null) => void;
};

export type RequestOptions = RequestInit & {
  isAuth?: boolean;
};
