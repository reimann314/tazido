import { useEffect, useState } from "react";
import { useQuery, type ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

let _token: string | null = null;
let _listeners: Array<() => void> = [];
let _convexClient: ConvexReactClient | null = null;

function notify() {
  _listeners.forEach((fn) => fn());
}

export function initClient(client: ConvexReactClient) {
  _convexClient = client;
}

export function getToken(): string | null {
  return _token;
}

export async function login(email: string, password: string): Promise<void> {
  if (!_convexClient) throw new Error("Convex client not initialized");
  const result = await _convexClient.action(api.auth.signIn, { email, password });
  _token = (result as { token: string }).token;
  notify();
}

export async function signup(body: Record<string, unknown>): Promise<void> {
  if (!_convexClient) throw new Error("Convex client not initialized");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (_convexClient.action as any)(api.auth.signUp, body);
  _token = (result as { token: string }).token;
  notify();
}

export async function logout() {
  if (_token && _convexClient) {
    try { await _convexClient.mutation(api.auth.signOut, { token: _token }); } catch { console.debug("logout: signOut failed"); }
  }
  _token = null;
  notify();
}

export function initAuth() {
  // Token is in-memory only — no persistence across page refreshes
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
  return useQuery(api.auth.me, { token });
}
