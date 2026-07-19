import useParallax from "../../hooks/useParallax.js";

/** Full-viewport hero: parallax church photo, title and the two calls to action. */
export default function Hero() {
  const offset = useParallax(0.28, 900);

  return (
    <header
      id="acasa"
      className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden bg-hero-base"
    >
      <div
        className="absolute -inset-x-[3%] -inset-y-[6%] bg-cover will-change-transform"
        style={{
          backgroundImage: `url(https://pub-8a480fbbd11b44939d3c3e5ff976f221.r2.dev/church-front-cloudy.png)`,
          backgroundPosition: "center 22%",
          transform: `translateY(${offset}px) scale(1.04)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,22,28,.34)_0%,rgba(20,22,28,.12)_34%,rgba(20,22,28,.30)_70%,rgba(20,22,28,.62)_100%)]" />

      <div className="relative max-w-[900px] px-6 text-center text-cream animate-fade-up">
        <div className="mb-[22px] flex items-center justify-center gap-4 opacity-90">
          <span className="h-px w-[54px] bg-cream/60" />
          <span className="font-heading text-[11px] tracking-[.34em] uppercase">
            Biserica Ortodoxă Română
          </span>
          <span className="h-px w-[54px] bg-cream/60" />
        </div>

        <h1 className="font-heading text-[clamp(40px,7vw,86px)] leading-[1.02] font-normal tracking-normal [text-shadow:0_2px_30px_rgba(0,0,0,.35)]">
          <span className="sr-only">Biserica Ortodoxă </span>
          Sfântul Mare Mucenic
          <br />
          <span className="text-gold-light">Gheorghe</span>
        </h1>

        <p className="mx-auto mt-[26px] max-w-[560px] text-[clamp(16px,2vw,20px)] leading-[1.7] text-cream/90 [text-shadow:0_1px_12px_rgba(0,0,0,.4)]">
          Parohia Sântana I, județul Arad - un locaș de rugăciune, liniște și mângâiere pentru
          comunitatea noastră.
        </p>

        <div className="mt-[38px] flex flex-wrap justify-center gap-3.5">
          <a
            href="#program"
            className="rounded border border-cream/75 px-7 py-[13px] font-heading text-[17px] tracking-[.04em] text-cream no-underline transition-colors duration-350 hover:bg-cream hover:text-hero-base"
          >
            Programul slujbelor
          </a>
          <a
            href="#contact"
            className="rounded border border-gold-light/70 px-7 py-[13px] font-heading text-[17px] tracking-[.04em] text-gold-light no-underline transition-colors duration-350 hover:bg-gold-light/16 hover:text-gold-light"
          >
            Cum ajungi la noi
          </a>
        </div>
      </div>

      <a
        href="#urmatoarea"
        className="absolute bottom-[26px] left-1/2 -translate-x-1/2 text-cream/85 no-underline hover:text-cream"
      >
        <span className="flex flex-col items-center gap-[7px] animate-sway">
          <span className="font-heading text-[10.5px] tracking-[.28em] uppercase">Descoperă</span>
          <span className="text-xl leading-none">⌄</span>
        </span>
      </a>
    </header>
  );
}
