import { useEffect, useMemo, useState } from "react";
import { initialAbout } from "../../data/adminContent.js";
import { getAbout, saveAbout } from "../../lib/content.js";
import AdminSection from "./AdminSection.jsx";
import RichTextEditor from "./RichTextEditor.jsx";
import useSectionDraft from "./useSectionDraft.js";
import { FieldLabel, inputClass } from "./fields.jsx";

export const ABOUT_MAX_CHARS = 14000;

/** Editor for „Despre parohie” — section title + rich text (max ~2000 words). */
export default function AboutEditor({ sectionId, onDirtyChange }) {
  const { draft, setDraft, dirty, discard, reset } = useSectionDraft(initialAbout);
  const [loading, setLoading] = useState(true);

  // Load the published content; on 404 (never saved) keep the local defaults.
  useEffect(() => {
    let active = true;
    getAbout()
      .then((data) => {
        if (active && data) reset(data);
      })
      .catch(() => {}) // network error — editable defaults remain usable
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reset]);

  useEffect(() => {
    onDirtyChange(sectionId, dirty);
  }, [dirty, onDirtyChange, sectionId]);

  // Plain-text length derived from the draft itself, so it stays correct
  // after Discard (when the editor content is reset from outside).
  const charCount = useMemo(
    () =>
      new DOMParser().parseFromString(draft.html || "", "text/html").body
        .textContent.length,
    [draft.html],
  );

  let error = "";
  if (!draft.title.trim()) {
    error = "Titlul secțiunii nu poate fi gol.";
  } else if (charCount > ABOUT_MAX_CHARS) {
    error = `Textul depășește limita de ${ABOUT_MAX_CHARS} de caractere.`;
  }

  async function handleSave() {
    // The response is the server-sanitised canonical payload — adopt it.
    const savedPayload = await saveAbout(draft);
    reset(savedPayload);
  }

  return (
    <AdminSection
      id={sectionId}
      kicker="Pagina principală"
      title="Despre parohie"
      description={`Titlul și textul de prezentare de pe pagina principală. Selectați textul pentru a-l formata (aldin, cursiv, subliniat) — fontul, mărimea și culoarea literelor rămân cele ale site-ului. Cel mult ${ABOUT_MAX_CHARS.toLocaleString("ro-RO")} de caractere (aproximativ 2000 de cuvinte).`}
      dirty={dirty}
      error={error}
      loading={loading}
      onSave={handleSave}
      onDiscard={discard}
    >
      <label className="mb-6 block max-w-[560px]">
        <FieldLabel>Titlul secțiunii</FieldLabel>
        <input
          type="text"
          value={draft.title}
          maxLength={90}
          placeholder="ex. O poartă către liniște, deschisă tuturor"
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          className={inputClass}
        />
      </label>

      <FieldLabel>Textul de prezentare</FieldLabel>
      <RichTextEditor
        value={draft.html}
        maxChars={ABOUT_MAX_CHARS}
        placeholder="Scrieți prezentarea parohiei…"
        ariaLabel="Textul de prezentare al parohiei"
        onChange={(html) => setDraft((prev) => ({ ...prev, html }))}
      />
    </AdminSection>
  );
}
