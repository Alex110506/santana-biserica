/**
 * Content API client — one getter and one saver per section.
 *
 * Getters resolve to `null` when the backend has no published content yet
 * (HTTP 404); callers then keep their bundled defaults. Savers require the
 * admin cookie (set at login) and throw `ApiError` with the backend's
 * Romanian `detail` message on failure.
 */

import { ApiError, apiFetch } from "./api.js";

async function getOrNull(path) {
  try {
    return await apiFetch(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// --- Despre parohie ---
export const getAbout = () => getOrNull("/content/about");
export const saveAbout = (payload) =>
  apiFetch("/content/about", { method: "POST", body: payload });

// --- Rânduiala săptămânii ---
export const getSchedule = () => getOrNull("/content/schedule");
export const saveSchedule = (items) =>
  apiFetch("/content/schedule", { method: "POST", body: { items } });

// --- Galerie foto ---
export const getGallery = () => getOrNull("/content/gallery");
export const saveGallery = (images) =>
  apiFetch("/content/gallery", { method: "POST", body: { images } });

/** Upload device files; resolves to `{ status, images: [{id,url,caption}] }`. */
export function uploadGalleryImages(files) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  return apiFetch("/content/gallery/images", { method: "POST", body: form });
}

// --- Preoți și cler ---
export const getClergy = () => getOrNull("/content/clergy");
export const saveClergy = (members) =>
  apiFetch("/content/clergy", { method: "POST", body: { members } });

// --- Anunțuri și evenimente ---
export const getEvents = () => getOrNull("/content/events");
export const saveEvents = (events) =>
  apiFetch("/content/events", { method: "POST", body: { events } });
