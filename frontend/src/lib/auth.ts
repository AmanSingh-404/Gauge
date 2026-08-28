import { apiFetch } from "./api";

const REFRESH_KEY = "gauge_refresh_token";

export function saveRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_KEY);
}


type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function getAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await apiFetch<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
    saveRefreshToken(data.refresh_token); // rotation — store the new one
    return data.access_token;
  } catch {
    clearRefreshToken();
    return null;
  }
}