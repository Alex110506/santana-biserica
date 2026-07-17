import { clergy } from "../../data/site.js";
import CrossIcon from "../ui/CrossIcon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Clergy() {
  return (
    <section
      id="cler"
      className="scroll-mt-[70px] bg-night px-[34px] py-[clamp(64px,9vw,120px)] text-night-ink"
    >
      <Reveal className="mx-auto max-w-[1120px]">
        <SectionHeading
          dark
          kicker="Slujitorii altarului"
          title="Preoți și cler"
          lead="Cei care slujesc Sfânta Liturghie și poartă grijă de sufletele comunității."
          className="mb-14"
        />
      </Reveal>

      <Reveal className="mx-auto grid max-w-[960px] gap-[26px] md:grid-cols-2 lg:grid-cols-3">
        {clergy.map((person) => (
          <div
            key={person.name}
            className="rounded-md border border-night-ink/18 px-[26px] py-[34px] text-center transition-[border-color,transform] duration-400 hover:-translate-y-1 hover:border-gold/60"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
              <CrossIcon />
            </div>
            <div className="mb-1.5 font-heading text-[25px] text-cream">{person.name}</div>
            <div className="text-[12.5px] tracking-[.16em] text-gold uppercase">{person.role}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
