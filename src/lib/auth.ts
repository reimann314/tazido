import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const TOKEN_KEY = "tazid_session_token";

export function getToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useCurrentUser() {
  const token = getToken() ?? undefined;
  return useQuery(api.auth.me, { token });
}
