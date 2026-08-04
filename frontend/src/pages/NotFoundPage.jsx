import { Link } from "react-router-dom";
import { navLinks, parish } from "../data/site.js";
import CrossIcon from "../components/ui/CrossIcon.jsx";
import usePageMeta from "../hooks/usePageMeta.js";

/**
 * Catch-all page for unknown URLs (`*`).
 *
 * The SPA shell is served for every path (see vercel.json / nginx.conf), so a
 * mistyped address arrives here with an HTTP 200; `noindex` keeps such soft-404
 * URLs out of search engines.
 *
 * Section links point at `/#ancora` as plain anchors on purpose: a full page
 * load lets the browser scroll to the section itself (react-router does not
 * restore the hash position on navigation).
 */
export default function NotFoundPage() {
  usePageMeta({
    title: "Pagina nu a fost găsită - Parohia Sântana I",
    robots: "noindex, follow",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-[560px] text-center">
        <CrossIcon className="mx-auto mb-4 text-bronze" />
        <div className="text-[11px] tracking-[.28em] text-burgundy uppercase">
          {parish.subtitle}
        </div>

        <div className="mt-7 flex items-center justify-center gap-5">
          <span className="h-px w-[54px] bg-ink/20" />
          <span className="font-heading text-[clamp(46px,9vw,72px)] leading-none tracking-[.06em] text-bronze">
            404
          </span>
          <span className="h-px w-[54px] bg-ink/20" />
        </div>

        <h1 className="mt-6 font-heading text-[clamp(30px,5vw,46px)] leading-[1.1] font-normal">
          Pagina nu a fost găsită
        </h1>
        <p className="mx-auto mt-3.5 max-w-[420px] text-[15.5px] leading-[1.8] text-ink-mute">
          Adresa căutată nu există sau a fost mutată. Te poți întoarce la pagina principală ori poți
          merge direct la una dintre secțiunile de mai jos.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <Link
            to="/"
            className="rounded border border-burgundy bg-burgundy px-7 py-[13px] font-heading text-[17px] tracking-[.04em] text-cream no-underline transition-colors duration-350 hover:bg-burgundy-deep hover:text-cream"
          >
            Înapoi acasă
          </Link>
          <a
            href="/#program"
            className="rounded border border-bronze/70 px-7 py-[13px] font-heading text-[17px] tracking-[.04em] text-bronze-deep no-underline transition-colors duration-350 hover:bg-bronze/10 hover:text-bronze-deep"
          >
            Programul slujbelor
          </a>
        </div>

        <nav
          aria-label="Secțiunile site-ului"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-ink/12 pt-7"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`/${link.href}`}
              className="rounded px-[13px] py-[7px] font-heading text-[16.5px] tracking-[.02em] text-ink no-underline transition-colors duration-300 hover:bg-burgundy/10 hover:text-burgundy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="mt-9 text-[13px] leading-[1.8] text-stone italic">{parish.psalm}</p>
      </div>
    </div>
  );
}
