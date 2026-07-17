import { weeklyProgram } from "../../data/site.js";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Schedule() {
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
        {weeklyProgram.map((row) => (
          <div
            key={row.day}
            className="grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-1.5 border-t border-ink/14 px-2 py-[22px] md:grid-cols-[200px_1fr_auto]"
          >
            <div className="font-heading text-[23px] text-ink">{row.day}</div>
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
