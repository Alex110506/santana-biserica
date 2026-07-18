import { useMemo, useState } from "react";
import { events as fallbackEvents } from "../../data/site.js";
import useContent from "../../hooks/useContent.js";
import { getEvents } from "../../lib/content.js";
import { eventSortKey, parseISODate, roMonthName, todayStart } from "../../lib/dates.js";
import Reveal from "../ui/Reveal.jsx";
import { Kicker } from "../ui/SectionHeading.jsx";

const FALLBACK = { events: fallbackEvents };

/** Cât de departe în viitor privește vizitatorul. */
const HORIZONS = [
  { days: 30, label: "30 de zile" },
  { days: 90, label: "90 de zile" },
  { days: 365, label: "1 an" },
];

/**
 * „Anunțuri și evenimente” — evenimentele din următoarele 30/90/365 de zile.
 * Lista derulează în propriul panou, deci rămâne așezată oricâte evenimente
 * ar aduna parohia (sau scraperul de calendar ortodox).
 */
export default function Announcements() {
  const data = useContent(getEvents, FALLBACK);
  const [horizon, setHorizon] = useState(HORIZONS[0].days);

  const upcoming = useMemo(() => {
    const start = todayStart();
    const end = new Date(start);
    end.setDate(end.getDate() + horizon);
    return data.events
      .filter((event) => {
        const date = parseISODate(event.date);
        return date >= start && date <= end;
      })
      .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));
  }, [data, horizon]);

  const currentYear = new Date().getFullYear();

  return (
    <section id="anunturi" className="scroll-mt-[70px] px-[34px] py-[clamp(64px,9vw,120px)]">
      <div className="mx-auto grid max-w-[1120px] gap-[clamp(36px,6vw,80px)] md:grid-cols-[.8fr_1.2fr]">
        <Reveal>
          <Kicker className="mb-4">Viața parohiei</Kicker>
          <h2 className="mb-[22px] font-heading text-[clamp(32px,4.4vw,52px)] leading-[1.08] font-normal tracking-normal">
            Anunțuri și evenimente
          </h2>
          <div className="mb-6 h-px w-14 bg-bronze" />
          <p className="text-base leading-[1.85] text-ink-mute">
            Sărbători, priveghere și momentele de bucurie ale comunității din anul bisericesc.
            Pentru înscrieri la slujbe și taine, vă rugăm să ne contactați.
          </p>

          <div className="mt-7">
            <div className="mb-2.5 text-[11px] tracking-[.2em] text-stone uppercase">
              Perioada afișată
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Perioada afișată">
              {HORIZONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  aria-pressed={horizon === option.days}
                  onClick={() => setHorizon(option.days)}
                  className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13.5px] transition-colors duration-250 ${
                    horizon === option.days
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-ink/20 text-ink-mute hover:border-burgundy/60 hover:text-burgundy"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-3 text-[13px] text-stone tabular-nums">
              {upcoming.length === 1
                ? "1 eveniment în perioada aleasă"
                : `${upcoming.length} evenimente în perioada aleasă`}
            </div>
            <div className="mt-2 text-[13px] leading-[1.6] text-stone">
              Datele cu{" "}
              <span className="font-semibold text-burgundy">roșu</span> marchează
              sărbătorile bisericești importante.
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="scroll-panel flex max-h-[540px] flex-col overflow-y-auto pr-3">
            {upcoming.length === 0 && (
              <p className="border-t border-ink/14 py-8 text-[15px] leading-[1.7] text-ink-mute">
                Nu sunt evenimente anunțate în perioada aleasă. Alegeți un interval mai
                lung sau reveniți curând.
              </p>
            )}

            {upcoming.map((event) => {
              const date = parseISODate(event.date);
              return (
                <div
                  key={event.id}
                  className="grid grid-cols-[96px_1fr] gap-6 border-t border-ink/14 px-1 py-6"
                >
                  <div className="text-center">
                    <div
                      className={`font-heading text-[34px] leading-none tabular-nums ${
                        event.holiday ? "text-burgundy" : "text-ink"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="mt-1 text-[11px] tracking-[.14em] text-stone uppercase">
                      {roMonthName(event.date)}
                    </div>
                    {date.getFullYear() !== currentYear && (
                      <div className="mt-0.5 text-[11px] text-stone/80 tabular-nums">
                        {date.getFullYear()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-heading text-[22px] text-ink">{event.title}</span>
                      {event.time && (
                        <span className="text-[13.5px] whitespace-nowrap text-burgundy tabular-nums">
                          ora {event.time}
                        </span>
                      )}
                    </div>
                    {event.desc && (
                      <div className="text-[14.5px] leading-[1.6] text-ink-mute">
                        {event.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="border-t border-ink/14" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
