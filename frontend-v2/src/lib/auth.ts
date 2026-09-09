/**
 * NLIP — Auth helpers
 * Access token is stored in memory only (Zustand), never in localStorage.
 * The refresh cookie is httpOnly and is handled automatically by the browser.
 */

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

/** Returns the Authorization header value, or undefined if not authenticated */
export function authHeader(): Record<string, string> {
  if (!_accessToken) return {};
  return { Authorization: `Bearer ${_accessToken}` };
}
