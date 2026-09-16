export const AUTH_TOKEN_KEY = "inmuconnect_auth_token";

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function browserAuthStorage(): AuthStorage | undefined {
  try {
    return globalThis.localStorage ?? globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

export function getAuthToken(storage = browserAuthStorage()) {
  try {
    return storage?.getItem(AUTH_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string, storage = browserAuthStorage()) {
  try {
    storage?.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    return;
  }
}

export function clearAuthToken(storage = browserAuthStorage()) {
  try {
    storage?.removeItem(AUTH_TOKEN_KEY);
  } catch {
    return;
  }
}
