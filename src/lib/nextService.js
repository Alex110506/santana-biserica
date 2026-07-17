import { serviceTimes } from "../data/site.js";

const DAY_NAMES = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const DAY_MS = 86_400_000;

/**
 * Finds the next scheduled service after `now` within the coming week.
 * Returns { title, when, rel } ready for display, e.g.
 * { title: "Sfânta Liturghie", when: "Duminică, 10:00", rel: "peste 2 zile" }.
 */
export function computeNextService(now = new Date()) {
  let best = null;

  for (let d = 0; d < 8; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    for (const s of serviceTimes) {
      if (s.dow !== day.getDay()) continue;
      const candidate = new Date(day);
      candidate.setHours(s.hour, 0, 0, 0);
      if (candidate > now && (!best || candidate < best.date)) {
        best = { date: candidate, service: s };
      }
    }
  }

  if (!best) return { title: "Sfânta Liturghie", when: "Duminică, 10:00", rel: "" };

  const days = Math.round(
    (new Date(best.date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / DAY_MS,
  );
  const rel = days === 0 ? "astăzi" : days === 1 ? "mâine" : `peste ${days} zile`;
  const time = `${String(best.date.getHours()).padStart(2, "0")}:00`;

  return { title: best.service.name, when: `${DAY_NAMES[best.date.getDay()]}, ${time}`, rel };
}
