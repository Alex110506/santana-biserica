import { initialAbout } from "../../data/adminContent.js";
import useContent from "../../hooks/useContent.js";
import { getAbout } from "../../lib/content.js";
import Reveal from "../ui/Reveal.jsx";
import { Kicker } from "../ui/SectionHeading.jsx";

const FACTS = [
  { value: "1972", label: "Anul zidirii" },
  { value: "23 apr.", label: "Ziua hramului" },
];

export default function About() {
  // Admin-edited title + rich text; the HTML is sanitised server-side to a
  // whitelist (b/strong, i/em, u, br, p, div — no attributes), so rendering it
  // here is safe.
  const about = useContent(getAbout, initialAbout);

  return (
    <section id="despre" className="scroll-mt-[70px] px-[34px] py-[clamp(64px,9vw,120px)]">
      <div className="mx-auto grid max-w-[1120px] items-center gap-[clamp(36px,6vw,84px)] md:grid-cols-[1.05fr_.95fr]">
        <Reveal>
          <Kicker className="mb-4">Despre parohie</Kicker>
          <h2 className="mb-[22px] font-heading text-[clamp(32px,4.4vw,52px)] leading-[1.08] font-normal tracking-normal">
            {about.title}
          </h2>
          <div className="mb-[26px] h-px w-14 bg-bronze" />
          {/* The text can now run up to ~2000 words, so it lives in its own
              scroll panel rather than pushing the whole page (and the paired
              photo) down. Short texts simply don't scroll. */}
          <div className="scroll-panel max-h-[clamp(340px,50vh,560px)] overflow-y-auto pr-4">
            <div
              className="text-justify text-[16.5px] leading-[1.85] text-ink-soft [&_strong]:font-semibold [&_b]:font-semibold"
              dangerouslySetInnerHTML={{ __html: about.html }}
            />
          </div>

          <div className="mt-[38px] flex flex-wrap gap-[38px]">
            {FACTS.map((fact, i) => (
              <div key={fact.label} className="contents">
                {i > 0 && <div className="w-px self-stretch bg-ink/14" />}
                <div>
                  <div className="font-heading text-[40px] font-normal text-bronze">
                    {fact.value}
                  </div>
                  <div className="mt-1 text-xs tracking-[.06em] text-stone uppercase">
                    {fact.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="figure" className="plate m-0 shadow-[0_12px_32px_rgba(45,43,43,.18)]">
          <img
            src="https://pub-8a480fbbd11b44939d3c3e5ff976f221.r2.dev/church_facade.png"
            alt="Fațada bisericii în lumina soarelui"
            loading="lazy"
            decoding="async"
            className="block h-[clamp(420px,60vh,620px)] w-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
