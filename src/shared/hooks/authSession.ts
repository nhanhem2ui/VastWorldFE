import type { AuthResponse } from "@/features/auth/types/AuthResponse";

const USER_KEY = "vastworld.user";

export type StoredUser = Pick<AuthResponse, "userID" | "username" | "email" | "role" | "playerID">;

export function saveUser(user: StoredUser) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): StoredUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthSession() {
  sessionStorage.removeItem(USER_KEY);
}

// This is only for fast check for routing
export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}

// Real check — call this on app boot / route guards where it matters
export async function checkAuth(): Promise<StoredUser | null> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${baseUrl}/api/auth/me`, { credentials: "include" });
  if (!res.ok) {
    clearAuthSession();
    return null;
  }
  const user: StoredUser = await res.json();
  saveUser(user);
  return user;
}