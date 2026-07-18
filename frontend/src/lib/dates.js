/**
 * Date helpers shared by the public sections and the admin dashboard.
 *
 * Event dates are stored as "YYYY-MM-DD" strings; helpers here always work in
 * LOCAL time (parsing with `new Date(string)` would interpret the value as UTC
 * and shift the day around midnight).
 */

/** Romanian day names indexed by `Date.getDay()` (0 = Duminică). */
export const RO_DAYS = [
  "Duminică",
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
];

const pad = (n) => String(n).padStart(2, "0");

/** Today at local midnight. */
export function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Parse "YYYY-MM-DD" as a local date. */
export function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a Date as "YYYY-MM-DD" (local). */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** ISO date `n` days from today — keeps mock data "upcoming" whenever viewed. */
export function isoDaysFromNow(n) {
  const date = todayStart();
  date.setDate(date.getDate() + n);
  return toISODate(date);
}

/** "luni, 20 iulie 2026" — long Romanian form for admin listings. */
export function formatRoLong(iso) {
  return parseISODate(iso).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Romanian month name ("iulie") for the date badges. */
export function roMonthName(iso) {
  return parseISODate(iso).toLocaleDateString("ro-RO", { month: "long" });
}

/** Sort key so events order by date, then by (optional) start time. */
export function eventSortKey(event) {
  return `${event.date}T${event.time || "00:00"}`;
}
