/**
 * Bundled default content for the editable sections.
 *
 * Used as the editors' starting values and the public pages' fallback until
 * the backend has published content (GET /content/<section> returns 404) or
 * when the API is unreachable.
 */

import { clergy, events } from "./site.js";

/** „Despre parohie” — title + rich text (only b/strong, i/em, u tags allowed). */
export const initialAbout = {
  title: "O poartă către liniște, deschisă tuturor",
  html:
    "Ridicată începând cu anul <strong>1972</strong> prin osteneala și dărnicia " +
    "credincioșilor din Sântana, biserica noastră poartă hramul Sfântului Mare " +
    "Mucenic Gheorghe, purtătorul de biruință. Zidurile ei albe și turlele " +
    "acoperite cu aramă au vegheat de atunci peste generații de familii, " +
    "botezuri, cununii și rugăciuni.<br><br>Astăzi, ea rămâne o casă a " +
    "rugăciunii unde ușile sunt deschise pentru fiecare — pentru cel care caută " +
    "pacea, pentru cel îndurerat și <em>pentru cel care voiește să mulțumească</em>.",
};

/**
 * „Rânduiala săptămânii” — one row per service.
 * `frequency: "weekly"` uses `days` (0 = Duminică … 6 = Sâmbătă);
 * `frequency: "monthly"` uses `ordinal` + `weekday` („prima vineri din lună”).
 * Monthly is the rarest allowed cadence — nothing happens less often.
 */
export const initialSchedule = [
  { id: "sl-utrenia", name: "Utrenia", time: "08:00", frequency: "weekly", days: [0], ordinal: "prima", weekday: 0 },
  { id: "sl-liturghie-dum", name: "Sfânta Liturghie", time: "10:00", frequency: "weekly", days: [0], ordinal: "prima", weekday: 0 },
  { id: "sl-liturghie-mie", name: "Sfânta Liturghie", time: "08:00", frequency: "weekly", days: [3], ordinal: "prima", weekday: 3 },
  { id: "sl-paraclis", name: "Paraclisul Maicii Domnului", time: "08:00", frequency: "weekly", days: [5], ordinal: "prima", weekday: 5 },
  { id: "sl-vecernia", name: "Vecernia", time: "18:00", frequency: "weekly", days: [6], ordinal: "prima", weekday: 6 },
  { id: "sl-maslu", name: "Sfântul Maslu", time: "17:00", frequency: "monthly", days: [], ordinal: "prima", weekday: 5 },
];

/** „Preoți și cler” — only priests (preot paroh / preot slujitor). */
export const initialClergy = clergy.map((person, i) => ({
  id: `cl-${i + 1}`,
  ...person,
}));

/** „Anunțuri și evenimente” — shares the dated mock events with the public site. */
export const initialEvents = events;
