import { RO_DAYS } from "./dates.js";

const DAY_MS = 86_400_000;
// A monthly service („prima vineri din lună”) can be almost five weeks away,
// so look far enough ahead to always find the next occurrence.
const LOOKAHEAD_DAYS = 40;

const ORDINAL_INDEX = { prima: 1, "a doua": 2, "a treia": 3, "a patra": 4 };

/** Whether a schedule item occurs on the given calendar day. */
function occursOn(item, day) {
  const dow = day.getDay();
  if (item.frequency === "weekly") return item.days.includes(dow);
  // Monthly: the n-th (or last) <weekday> of the month.
  if (dow !== item.weekday) return false;
  if (item.ordinal === "ultima") {
    const daysInMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
    return day.getDate() + 7 > daysInMonth;
  }
  return Math.ceil(day.getDate() / 7) === ORDINAL_INDEX[item.ordinal];
}

/**
 * Find the next scheduled service after `now` from the (admin-managed)
 * schedule items. Returns { title, when, rel } ready for display, e.g.
 * { title: "Sfânta Liturghie", when: "Duminică, 10:00", rel: "peste 2 zile" }.
 */
export function computeNextService(items, now = new Date()) {
  let best = null;

  for (let d = 0; d <= LOOKAHEAD_DAYS; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    for (const item of items) {
      if (!item.time || !occursOn(item, day)) continue;
      const [hour, minute] = item.time.split(":").map(Number);
      const candidate = new Date(day);
      candidate.setHours(hour, minute, 0, 0);
      if (candidate > now && (!best || candidate < best.date)) {
        best = { date: candidate, item };
      }
    }
    // Everything later than an already-found candidate can't beat it.
    if (best) break;
  }

  if (!best) return { title: "Sfânta Liturghie", when: "Duminică, 10:00", rel: "" };

  const days = Math.round(
    (new Date(best.date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / DAY_MS,
  );
  const rel = days === 0 ? "astăzi" : days === 1 ? "mâine" : `peste ${days} zile`;

  return {
    title: best.item.name,
    when: `${RO_DAYS[best.date.getDay()]}, ${best.item.time}`,
    rel,
  };
}
