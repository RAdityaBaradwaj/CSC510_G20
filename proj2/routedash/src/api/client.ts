import Constants from "expo-constants";

const API_URL =
  (Constants?.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  (Constants?.manifest?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "http://localhost:4000";

type RequestOptions = RequestInit & {
  requireAuth?: boolean;
};

export const apiFetch = async <T>(
  path: string,
  { headers, requireAuth = true, ...options }: RequestOptions = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    ...options
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error ?? "Unexpected API error");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};

export const apiPost = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined
  });

export const apiPatch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined
  });

export const apiDelete = <T>(path: string, options?: RequestOptions) =>
  apiFetch<T>(path, {
    ...options,
    method: "DELETE"
  });
