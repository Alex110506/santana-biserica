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

/** A priest is „current” while the „Încă în funcție” flag is set. */
function isCurrent(person) {
  return !!person.current;
}

/** Oldest ministry first; priests without a start year go last. */
function byStartYearAsc(a, b) {
  return (a.startYear ?? Infinity) - (b.startYear ?? Infinity);
}

/** Most recent ministry first; priests without a start year go last. */
function byStartYearDesc(a, b) {
  return (b.startYear ?? -Infinity) - (a.startYear ?? -Infinity);
}

/** Full clergy card — used for the priests currently serving. */
function PriestCard({ person }) {
  const tenure = formatTenure(person);
  return (
    <div className="rounded-md border border-night-ink/18 px-[26px] py-[34px] text-center transition-[border-color,transform] duration-400 hover:-translate-y-1 hover:border-gold/60">
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
}

/** Compact list row for a priest who has served in the past. */
function PastPriestRow({ person }) {
  const tenure = formatTenure(person);
  return (
    <li className="flex items-center gap-4 rounded-md border border-night-ink/12 px-5 py-3.5 transition-[border-color] duration-400 hover:border-gold/50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/45 text-gold">
        <CrossIcon className="h-[26px] w-auto" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[19px] leading-tight text-cream">{person.name}</span>
        <span className="mt-0.5 block text-[10.5px] tracking-[.16em] text-gold uppercase">
          {person.role}
        </span>
      </span>
      {tenure && (
        <span className="shrink-0 text-[13px] tracking-[.02em] text-night-ink/60 tabular-nums">
          {tenure}
        </span>
      )}
    </li>
  );
}

export default function Clergy() {
  const clergy = useContent(getClergy, FALLBACK);
  const current = clergy.members.filter(isCurrent).sort(byStartYearAsc);
  const past = clergy.members.filter((person) => !isCurrent(person)).sort(byStartYearDesc);
  const hasPast = past.length > 0;

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

      {hasPast ? (
        <Reveal className="mx-auto grid max-w-[1120px] gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
          {/* Current priests — left on desktop, first on mobile. */}
          <div className="grid content-start gap-[26px] sm:grid-cols-2 lg:grid-cols-1">
            {current.map((person) => (
              <PriestCard key={person.id ?? person.name} person={person} />
            ))}
          </div>

          {/* Past priests — right on desktop, below on mobile; scrolls when tall. */}
          <div className="border-t border-night-ink/12 pt-10 lg:border-t-0 lg:pt-0">
            <h3 className="mb-6 font-heading text-[clamp(21px,2.4vw,27px)] leading-tight font-normal text-cream">
              Preoți care au slujit de-a lungul timpului
            </h3>
            <ul className="flex flex-col gap-3 lg:max-h-[66vh] lg:overflow-y-auto lg:pr-3 lg:[scrollbar-color:rgba(201,162,90,0.35)_transparent] lg:[scrollbar-width:thin]">
              {past.map((person) => (
                <PastPriestRow key={person.id ?? person.name} person={person} />
              ))}
            </ul>
          </div>
        </Reveal>
      ) : (
        <Reveal className="mx-auto grid max-w-[960px] justify-center gap-[26px] md:grid-cols-2">
          {current.map((person) => (
            <PriestCard key={person.id ?? person.name} person={person} />
          ))}
        </Reveal>
      )}
    </section>
  );
}
