// Server-only: Server Actions, Route Handlers, Server Components.
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";

async function authHeader(): Promise<string | undefined> {
  const store = await cookies();
  const token = store.get("c360-token")?.value;
  return token ? `Bearer ${token}` : undefined;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const auth = await authHeader();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth) headers["Authorization"] = auth;
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchWithToken(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
}
