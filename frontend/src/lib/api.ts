const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Something went wrong." }));
    throw new Error(error.detail || "Request failed.");
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}