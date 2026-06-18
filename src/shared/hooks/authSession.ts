import type { AuthResponse } from "@/features/auth/types/AuthResponse";

const AUTH_SESSION_KEY = "vastworld.auth";
const JWT_KEY = "vastworld.jwt";

export type StoredUser =
  Pick<AuthResponse,
  "userID" |
  "username" |
  "email" |
  "role" |
  "playerID"
  >;

export type AuthSession = {
  token: string;
  expiresIn: number;
  user: StoredUser;
};

export function savePlayerID(playerID:string){
  const session = getAuthSession();
  if (!session) return;

  session.user.playerID = playerID;
  const storage = window.localStorage.getItem(AUTH_SESSION_KEY) ? window.localStorage : window.sessionStorage;

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)
  );
}

export function saveAuthSession(auth: AuthResponse, remember: boolean) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const otherStorage = remember ? window.sessionStorage : window.localStorage;

  const authSession: AuthSession = {
    token: auth.token,
    expiresIn: auth.expiresIn,
    user: {
      userID: auth.userID,
      username: auth.username,
      email: auth.email,
      role: auth.role,
      playerID: auth.playerID
    },
  };

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
  storage.setItem(JWT_KEY, auth.token);

  otherStorage.removeItem(AUTH_SESSION_KEY);
  otherStorage.removeItem(JWT_KEY);
}

// Get the full session (token + user info)
export function getAuthSession(): AuthSession | null {
  const raw =
    window.localStorage.getItem(AUTH_SESSION_KEY) ??
    window.sessionStorage.getItem(AUTH_SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

// Get just the JWT token
export function getAuthToken(): string | null {
  return (
    window.localStorage.getItem(JWT_KEY) ??
    window.sessionStorage.getItem(JWT_KEY)
  );
}

// Get the stored user info
export function getStoredUser(): StoredUser | null {
  return getAuthSession()?.user ?? null;
}

// Check if user is logged in
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Clear session on logout
export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(JWT_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(JWT_KEY);
}
