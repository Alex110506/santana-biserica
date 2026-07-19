/**
 * Low-level API transport.
 *
 * Wraps `fetch` with the backend base URL (from `VITE_BACKEND_URL`) and always
 * sends credentials so the httpOnly auth cookie is included on every request.
 */

/** Normalise `VITE_BACKEND_URL` — ensure a scheme and no trailing slash. */
function resolveBaseUrl() {
  const raw = (import.meta.env.VITE_BACKEND_URL ?? "").trim();
  // In production the env var may be absent — fall back to the deployed backend.
  const url = raw || "https://api.parohia-santana-1.ro";
  const withScheme = /^https?:\/\//i.test(url) ? url : `http://${url}`;
  return withScheme.replace(/\/+$/, "");
}

export const BACKEND_URL = resolveBaseUrl();

/** Error carrying the HTTP status and the backend's `detail` message. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Perform a JSON request against the backend.
 *
 * @param {string} path - API path beginning with "/" (e.g. "/auth/login").
 * @param {RequestInit & { body?: unknown }} [options]
 * @returns {Promise<any>} Parsed JSON body (or `null` for empty responses).
 */
export async function apiFetch(path, { body, headers, ...rest } = {}) {
  // FormData bodies (file uploads) go through untouched — the browser sets the
  // multipart Content-Type with its boundary itself.
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${BACKEND_URL}${path}`, {
    // Send/receive the auth cookie across origins.
    credentials: "include",
    headers: {
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: isForm ? body : JSON.stringify(body) } : {}),
    ...rest,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Request failed (${response.status}).`;
    throw new ApiError(detail, response.status);
  }

  return data;
}
