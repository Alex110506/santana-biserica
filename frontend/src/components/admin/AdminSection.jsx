import { useEffect, useState } from "react";
import { Kicker } from "../ui/SectionHeading.jsx";

/**
 * Card wrapping one editable dashboard section.
 *
 * Renders the section header, the editor (children) and the mandatory footer
 * with „Salvează” / „Renunță la modificări”. Buttons are enabled only when
 * there are unsaved changes; `error` (a validation message) blocks saving.
 * `onSave` may be async (it POSTs to the backend): while it runs the buttons
 * lock, and a rejection shows the thrown message (the API's Romanian detail).
 */
export default function AdminSection({
  id,
  kicker,
  title,
  description,
  dirty,
  error = "",
  loading = false,
  onSave,
  onDiscard,
  children,
}) {
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 3200);
    return () => clearTimeout(timer);
  }, [justSaved]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      await onSave();
      setJustSaved(true);
    } catch (err) {
      setSaveError(err?.message || "Salvarea a eșuat. Încercați din nou.");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    onDiscard();
    setJustSaved(false);
    setSaveError("");
  }

  let status;
  if (saving) {
    status = <span className="text-ink-mute">Se salvează…</span>;
  } else if (saveError) {
    status = <span className="text-burgundy">{saveError}</span>;
  } else if (error) {
    status = <span className="text-burgundy">{error}</span>;
  } else if (dirty) {
    status = (
      <span className="text-ink-mute">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-bronze align-middle" />
        Modificări nesalvate
      </span>
    );
  } else if (justSaved) {
    status = <span className="text-bronze-deep">✓ Modificările au fost salvate.</span>;
  } else {
    status = <span className="text-stone">Nu există modificări nesalvate.</span>;
  }

  return (
    <section
      id={id}
      className="scroll-mt-[135px] rounded-lg border border-ink/14 bg-card shadow-[0_2px_14px_rgba(45,43,43,.05)] lg:scroll-mt-[100px]"
    >
      <header className="border-b border-ink/10 px-[clamp(20px,3.4vw,34px)] py-6">
        <Kicker className="mb-2">{kicker}</Kicker>
        <h2 className="font-heading text-[clamp(24px,3vw,30px)] leading-[1.15] font-normal">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-[640px] text-[14.5px] leading-[1.7] text-ink-mute">
            {description}
          </p>
        )}
      </header>

      <div className="px-[clamp(20px,3.4vw,34px)] py-7">
        {loading ? (
          <p className="text-[14.5px] text-stone">Se încarcă datele…</p>
        ) : (
          children
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-ink/10 px-[clamp(20px,3.4vw,34px)] py-5">
        <div className="text-[14px] leading-[1.5]" role="status">
          {status}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!dirty || saving || loading}
            className="cursor-pointer rounded border border-ink/25 px-5 py-2.5 text-[15px] text-ink-mute transition-colors duration-300 hover:border-burgundy hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-45"
          >
            Renunță la modificări
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || Boolean(error) || saving || loading}
            className="cursor-pointer rounded border border-burgundy bg-burgundy px-6 py-2.5 font-heading text-[17px] text-cream transition-colors duration-350 hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează modificările"}
          </button>
        </div>
      </footer>
    </section>
  );
}
