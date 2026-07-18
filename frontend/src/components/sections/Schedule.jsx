import { useMemo } from "react";
import { initialSchedule } from "../../data/adminContent.js";
import useContent from "../../hooks/useContent.js";
import { getSchedule } from "../../lib/content.js";
import { RO_DAYS } from "../../lib/dates.js";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

const FALLBACK = { items: initialSchedule };

/** Week shown Monday-first when listing a service's days. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** "Duminică, Miercuri" for weekly items, "Prima vineri din lună" for monthly. */
function dayLabel(item) {
  if (item.frequency === "monthly") {
    const phrase = `${item.ordinal} ${RO_DAYS[item.weekday].toLowerCase()} din lună`;
    return phrase.charAt(0).toUpperCase() + phrase.slice(1);
  }
  return WEEK_ORDER.filter((day) => item.days.includes(day))
    .map((day) => RO_DAYS[day])
    .join(", ");
}

export default function Schedule() {
  const schedule = useContent(getSchedule, FALLBACK);

  const rows = useMemo(
    () =>
      schedule.items.map((item) => ({
        id: item.id,
        day: dayLabel(item),
        service: item.name,
        time: item.time,
      })),
    [schedule],
  );

  return (
    <section id="program" className="scroll-mt-[70px] bg-surface px-[34px] py-[clamp(64px,9vw,120px)]">
      <Reveal className="mx-auto max-w-[1000px]">
        <SectionHeading
          kicker="Rânduiala săptămânii"
          title="Programul slujbelor"
          lead="Vă așteptăm la sfintele slujbe. Spovedania se face cu o oră înainte de fiecare Sfântă Liturghie sau la cerere."
          className="mb-12"
        />
      </Reveal>

      <Reveal className="mx-auto flex max-w-[840px] flex-col">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-1.5 border-t border-ink/14 px-2 py-[22px] md:grid-cols-[240px_1fr_auto]"
          >
            <div className="font-heading text-[23px] leading-[1.25] text-ink">{row.day}</div>
            <div className="order-last col-span-2 text-[15.5px] leading-[1.55] text-ink-mute md:order-none md:col-span-1">
              {row.service}
            </div>
            <div className="font-heading text-[19px] tracking-[.02em] whitespace-nowrap text-burgundy tabular-nums">
              {row.time}
            </div>
          </div>
        ))}
        <div className="border-t border-ink/14" />
      </Reveal>
    </section>
  );
}
