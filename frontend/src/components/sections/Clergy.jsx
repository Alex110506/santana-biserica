import { initialClergy } from "../../data/adminContent.js";
import useContent from "../../hooks/useContent.js";
import { getClergy } from "../../lib/content.js";
import CrossIcon from "../ui/CrossIcon.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

const FALLBACK = { members: initialClergy };

/** „1998 – prezent”, „1972 – 1998” or „din 1985” — empty when no start year. */
function formatTenure(person) {
  if (person.startYear == null) return "";
  if (person.current) return `${person.startYear} – prezent`;
  if (person.endYear != null) return `${person.startYear} – ${person.endYear}`;
  return `din ${person.startYear}`;
}

/** Oldest ministry first; priests without a start year go last. */
function byStartYear(a, b) {
  return (a.startYear ?? Infinity) - (b.startYear ?? Infinity);
}

export default function Clergy() {
  const clergy = useContent(getClergy, FALLBACK);
  const members = [...clergy.members].sort(byStartYear);

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

      <Reveal className="mx-auto grid max-w-[960px] justify-center gap-[26px] md:grid-cols-2">
        {members.map((person) => {
          const tenure = formatTenure(person);
          return (
            <div
              key={person.id ?? person.name}
              className="rounded-md border border-night-ink/18 px-[26px] py-[34px] text-center transition-[border-color,transform] duration-400 hover:-translate-y-1 hover:border-gold/60"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
                <CrossIcon />
              </div>
              <h3 className="mb-1.5 font-heading text-[25px] font-normal text-cream">{person.name}</h3>
              <div className="text-[12.5px] tracking-[.16em] text-gold uppercase">{person.role}</div>
              {tenure && (
                <div className="mt-2.5 text-[13.5px] tracking-[.02em] text-night-ink/70 tabular-nums">
                  {tenure}
                </div>
              )}
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
