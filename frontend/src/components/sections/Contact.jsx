import { contactRows, mapsEmbed, mapsLink } from "../../data/site.js";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-[70px] bg-surface px-3 pt-[clamp(64px,9vw,120px)] pb-0 md:px-[34px]"
    >
      <Reveal className="mx-auto max-w-[1120px]">
        <SectionHeading kicker="Vino în mijlocul nostru" title="Contact și locație" className="mb-12" />
      </Reveal>

      <Reveal className="mx-auto grid max-w-[1120px] overflow-hidden rounded-lg border border-ink/14 bg-card md:grid-cols-[1fr_1.15fr]">
        {/* min-w-0: lasă coloana să se strângă sub lățimea e-mailului (altfel
            textul iese din card pe mobil); break-words rupe token-urile lungi. */}
        <div className="min-w-0 p-5 md:p-[clamp(32px,4vw,52px)]">
          {contactRows.map((row) => (
            <div key={row.label} className="border-b border-ink/10 py-5">
              <div className="mb-2 text-[11px] tracking-[.2em] text-burgundy uppercase">
                {row.label}
              </div>
              <div className="text-[16.5px] leading-[1.6] break-words text-ink">
                {row.value}
              </div>
            </div>
          ))}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[26px] inline-flex items-center gap-2 rounded border border-burgundy px-6 py-3 font-heading text-[17px] text-burgundy no-underline transition-colors duration-350 hover:bg-burgundy hover:text-cream"
          >
            Deschide în Google Maps →
          </a>
        </div>

        <div className="relative min-h-[420px] bg-[#d7d3d3]">
          <iframe
            title="Harta bisericii"
            src={mapsEmbed}
            className="absolute inset-0 h-full w-full border-0 [filter:sepia(.12)_saturate(.9)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>

      <div className="h-[clamp(64px,9vw,120px)]" />
    </section>
  );
}
