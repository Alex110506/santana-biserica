import { events } from "../../data/site.js";
import Reveal from "../ui/Reveal.jsx";
import { Kicker } from "../ui/SectionHeading.jsx";

export default function Announcements() {
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
        </Reveal>

        <Reveal className="flex flex-col">
          {events.map((event) => (
            <div
              key={event.title}
              className="grid grid-cols-[96px_1fr] gap-6 border-t border-ink/14 px-1 py-6"
            >
              <div className="text-center">
                <div className="font-heading text-[34px] leading-none text-burgundy tabular-nums">
                  {event.day}
                </div>
                <div className="mt-1 text-[11px] tracking-[.14em] text-stone uppercase">
                  {event.month}
                </div>
              </div>
              <div>
                <div className="mb-1.5 font-heading text-[22px] text-ink">{event.title}</div>
                <div className="text-[14.5px] leading-[1.6] text-ink-mute">{event.desc}</div>
              </div>
            </div>
          ))}
          <div className="border-t border-ink/14" />
        </Reveal>
      </div>
    </section>
  );
}
