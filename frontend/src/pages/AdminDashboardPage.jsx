import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../lib/auth.js";
import { parish } from "../data/site.js";
import CrossIcon from "../components/ui/CrossIcon.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import AboutEditor from "../components/admin/AboutEditor.jsx";
import ScheduleEditor from "../components/admin/ScheduleEditor.jsx";
import GalleryEditor from "../components/admin/GalleryEditor.jsx";
import ClergyEditor from "../components/admin/ClergyEditor.jsx";
import EventsEditor from "../components/admin/EventsEditor.jsx";

const SECTIONS = [
  { id: "despre", label: "Despre parohie", Editor: AboutEditor },
  { id: "program", label: "Rânduiala săptămânii", Editor: ScheduleEditor },
  { id: "galerie", label: "Galerie foto", Editor: GalleryEditor },
  { id: "cler", label: "Preoți și cler", Editor: ClergyEditor },
  { id: "anunturi", label: "Anunțuri și evenimente", Editor: EventsEditor },
];

/**
 * Admin dashboard (`/admin/dashboard`) — reached only through <ProtectedRoute>.
 *
 * Each section edits a local draft (mock data, no backend yet) and has its own
 * „Salvează” / „Renunță” footer. The sidebar tracks the visible section and
 * marks the ones with unsaved changes.
 */
export default function AdminDashboardPage() {
  // Zona de administrare nu se indexează (vezi și robots.txt / X-Robots-Tag).
  usePageMeta({ title: "Administrare - Parohia Sântana I", robots: "noindex, nofollow" });

  const navigate = useNavigate();
  const [dirtySections, setDirtySections] = useState({});
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const reportDirty = useCallback((id, dirty) => {
    setDirtySections((prev) => (prev[id] === dirty ? prev : { ...prev, [id]: dirty }));
  }, []);

  const anyDirty = useMemo(
    () => Object.values(dirtySections).some(Boolean),
    [dirtySections],
  );

  // Nu lăsa pagina să se închidă cu modificări nesalvate.
  useEffect(() => {
    if (!anyDirty) return;
    function warn(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  // Evidențiază în meniu secțiunea aflată în dreptul privitorului.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function handleLogout() {
    if (
      anyDirty &&
      !window.confirm("Există modificări nesalvate. Sigur doriți să ieșiți?")
    ) {
      return;
    }
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const navLink = (section, extra = "") => (
    <a
      key={section.id}
      href={`#${section.id}`}
      className={extra}
      aria-current={activeId === section.id ? "true" : undefined}
    >
      {section.label}
      {dirtySections[section.id] && (
        <span
          className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-bronze align-middle"
          title="Modificări nesalvate"
        />
      )}
    </a>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* Bara de sus */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-[6px]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <CrossIcon className="shrink-0 text-bronze" />
            <div className="min-w-0">
              <div className="truncate text-[10.5px] tracking-[.24em] text-burgundy uppercase">
                {parish.subtitle} · Administrare
              </div>
              <div className="truncate font-heading text-[22px] leading-[1.2] text-ink">
                Panou de control
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden text-[14px] text-stone transition-colors duration-300 hover:text-bronze sm:block"
            >
              Vezi site-ul ↗
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded border border-burgundy px-4.5 py-2 font-heading text-[15.5px] text-burgundy transition-colors duration-350 hover:bg-burgundy hover:text-cream"
            >
              Ieșire
            </button>
          </div>
        </div>
      </header>

      {/* Meniu pe mobil — șiruri de „pastile” derulabile orizontal */}
      <nav className="sticky top-[74px] z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-[6px] lg:hidden">
        <div className="flex gap-2 overflow-x-auto px-6 py-3">
          {SECTIONS.map((section) =>
            navLink(
              section,
              `shrink-0 rounded-full border px-4 py-1.5 text-[13.5px] whitespace-nowrap no-underline transition-colors duration-250 ${
                activeId === section.id
                  ? "border-burgundy bg-burgundy text-cream"
                  : "border-ink/15 text-ink-mute hover:border-burgundy/50"
              }`,
            ),
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-[1280px] gap-12 px-6 py-10 lg:grid lg:grid-cols-[230px_1fr]">
        {/* Meniul lateral (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-[110px] flex flex-col border-l border-ink/12">
            <div className="mb-3 pl-4 text-[10.5px] tracking-[.24em] text-stone uppercase">
              Secțiuni
            </div>
            {SECTIONS.map((section) =>
              navLink(
                section,
                `-ml-px border-l-2 py-2.5 pl-4 text-[15px] no-underline transition-colors duration-250 ${
                  activeId === section.id
                    ? "border-burgundy text-burgundy"
                    : "border-transparent text-ink-mute hover:text-burgundy"
                }`,
              ),
            )}
          </nav>
        </aside>

        {/* Secțiunile editabile */}
        <main className="flex min-w-0 flex-col gap-10">
          {SECTIONS.map(({ id, Editor }) => (
            <Editor key={id} sectionId={id} onDirtyChange={reportDirty} />
          ))}

          <p className="pb-4 text-center text-[13px] text-stone">
            Demonstrație cu date locale — modificările nu se trimit încă spre server.
          </p>
        </main>
      </div>
    </div>
  );
}
