/**
 * Admin authentication (domain layer).
 *
 * The JWT is kept in an httpOnly cookie set by the backend, so it is NOT
 * readable from JavaScript. Auth state is therefore verified by asking the
 * backend (`/auth/me`) rather than inspecting a client-side token.
 */

import { apiFetch, ApiError } from "./api.js";

/**
 * Log in with the given credentials.
 * On success the backend sets the auth cookie and returns the admin.
 * @returns {Promise<{ username: string }>} the authenticated admin
 */
export async function login(username, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { username, password },
  });
  return data.admin;
}

/** Log out — clears the auth cookie on the backend. */
export async function logout() {
  await apiFetch("/auth/logout", { method: "POST" });
}

/**
 * Return the currently authenticated admin, or `null` if the session is
 * missing/expired (backend responds 401).
 * @returns {Promise<{ username: string } | null>}
 */
export async function getCurrentAdmin() {
  try {
    return await apiFetch("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    // Network/unexpected errors bubble up so the caller can distinguish them.
    throw error;
  }
}
