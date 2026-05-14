import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ADMIN_TOKEN_KEY = "tazid_admin_token";

export function getAdminToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function useAdmin() {
  const token = getAdminToken() ?? undefined;
  return useQuery(api.admin.adminMe, { token });
}
