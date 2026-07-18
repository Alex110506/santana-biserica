import { initialSchedule } from "../../data/adminContent.js";
import useContent from "../../hooks/useContent.js";
import useNextService from "../../hooks/useNextService.js";
import { getSchedule } from "../../lib/content.js";

const FALLBACK = { items: initialSchedule };

/** Dark strip announcing the next scheduled service, computed live from the schedule. */
export default function NextServiceStrip() {
  const schedule = useContent(getSchedule, FALLBACK);
  const next = useNextService(schedule.items);

  return (
    <section id="urmatoarea" className="scroll-mt-[70px] bg-night px-[34px] py-[26px] text-night-ink">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-[30px] gap-y-3 text-center">
        <span className="text-[11px] tracking-[.28em] text-gold uppercase">Următoarea slujbă</span>
        <span className="hidden h-4 w-px bg-night-ink/28 sm:block" />
        <span className="font-heading text-[clamp(22px,3vw,30px)] font-normal">{next.title}</span>
        <span className="text-[15px] text-night-ink/80">
          {next.when}
          {next.rel && ` · ${next.rel}`}
        </span>
      </div>
    </section>
  );
}
