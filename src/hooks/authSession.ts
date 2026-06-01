import type { AuthResponse } from "../types/AuthResponse";

const AUTH_SESSION_KEY = "vastworld.auth";
const JWT_KEY = "vastworld.jwt";

export type StoredUser = Pick<AuthResponse, "username" | "email" | "role">;

export type AuthSession = {
  token: string;
  expiresIn: number;
  user: StoredUser;
};

export function saveAuthSession(auth: AuthResponse, remember: boolean) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const otherStorage = remember ? window.sessionStorage : window.localStorage;

  const authSession: AuthSession = {
    token: auth.token,
    expiresIn: auth.expiresIn,
    user: {
      username: auth.username,
      email: auth.email,
      role: auth.role,
    },
  };

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
  storage.setItem(JWT_KEY, auth.token);

  otherStorage.removeItem(AUTH_SESSION_KEY);
  otherStorage.removeItem(JWT_KEY);
}

