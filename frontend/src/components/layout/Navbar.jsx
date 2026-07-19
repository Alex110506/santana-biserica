import { useState } from "react";
import { navLinks, parish } from "../../data/site.js";
import useScrolled from "../../hooks/useScrolled.js";
import CrossIcon from "../ui/CrossIcon.jsx";

/**
 * Fixed navbar: translucent dark glass over the hero, turns to paper once
 * the page scrolls. Collapses into a hamburger menu below `md`.
 */
export default function Navbar() {
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const ink = scrolled ? "text-ink" : "text-cream";

  return (
    <>
      <nav
        aria-label="Navigare principală"
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b px-[34px] py-[14px] backdrop-blur-[10px] transition-colors duration-500 ${
          scrolled
            ? "border-ink/10 bg-[rgba(243,242,242,.92)]"
            : "border-cream/15 bg-[rgba(20,22,28,.18)]"
        }`}
      >
        <a href="#acasa" onClick={close} className="flex items-center gap-3 no-underline">
          <CrossIcon className="text-bronze" />
          <span className="flex flex-col leading-[1.05]">
            <span
              className={`font-heading text-lg font-semibold tracking-[.01em] transition-colors duration-500 ${ink}`}
            >
              {parish.shortName}
            </span>
            <span
              className={`text-[10.5px] tracking-[.24em] uppercase transition-colors duration-500 ${
                scrolled ? "text-burgundy" : "text-cream/70"
              }`}
            >
              {parish.subtitle}
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded px-[13px] py-[7px] font-heading text-[16.5px] tracking-[.02em] no-underline transition-colors duration-300 hover:bg-burgundy/10 hover:text-burgundy ${ink}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Meniu"
          aria-expanded={open}
          className={`inline-flex cursor-pointer rounded border bg-transparent px-[11px] py-2 text-[15px] md:hidden ${
            scrolled ? "border-ink/20 text-ink" : "border-cream/40 text-cream"
          }`}
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="fixed inset-x-0 top-[60px] z-40 flex flex-col border-b border-ink/12 bg-card px-[22px] pt-2 pb-[18px] shadow-[0_12px_32px_rgba(45,43,43,.14)] md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="border-b border-ink/8 px-1 py-[11px] font-heading text-[19px] text-ink no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
