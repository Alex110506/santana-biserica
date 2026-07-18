/** Small-caps, letter-spaced label above a heading. */
export function Kicker({ children, dark = false, className = "" }) {
  return (
    <div
      className={`text-[11px] tracking-[.28em] uppercase ${dark ? "text-gold" : "text-burgundy"} ${className}`}
    >
      {children}
    </div>
  );
}

/** Centered kicker + display heading (+ optional lead paragraph) opening a section. */
export default function SectionHeading({ kicker, title, lead, dark = false, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <Kicker dark={dark} className="mb-4">
        {kicker}
      </Kicker>
      <h2 className="font-heading text-[clamp(32px,4.4vw,52px)] leading-[1.1] font-normal tracking-normal">
        {title}
      </h2>
      {lead && (
        <p
          className={`mx-auto mt-3.5 max-w-[560px] text-base leading-[1.8] ${
            dark ? "text-night-ink/70" : "text-ink-mute"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
