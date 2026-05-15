import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

let _token: string | null = null;
let _listeners: Array<() => void> = [];

const SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "";

function notify() {
  _listeners.forEach((fn) => fn());
}

export function getToken(): string | null {
  return _token;
}

function setToken(token: string) {
  _token = token;
  notify();
}

function clearToken() {
  _token = null;
  notify();
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${SITE_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string>) },
    ...options,
  });
  if (!res.ok) {
    let msg = "حدث خطأ";
    try {
      const errBody = await res.json();
      msg = errBody.message || errBody.error || msg;
    } catch { console.debug("apiFetch: failed to parse error body"); }
    throw new Error(msg);
  }
  return res.json();
}

let _initPromise: Promise<void> | null = null;

export function initAuth(): Promise<void> {
  if (!_initPromise) {
    _initPromise = (async () => {
    try {
      const url = `${SITE_URL}/api/auth/session`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          _token = data.token;
          notify();
        }
      }
    } catch { console.debug("initAuth: no session"); }
    })();
  }
  return _initPromise;
}

export async function login(email: string, password: string): Promise<string> {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.token;
}

export async function signup(body: Record<string, unknown>): Promise<string> {
  const data = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setToken(data.token);
  return data.token;
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch { console.debug("logout: session may be expired"); }
  clearToken();
}

export function useCurrentUser() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  const token = _token ?? undefined;
  return useQuery(api.auth.me, token ? { token } : "skip");
}
