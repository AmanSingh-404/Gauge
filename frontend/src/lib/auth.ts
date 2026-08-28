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