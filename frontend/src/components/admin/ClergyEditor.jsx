import { useEffect, useState } from "react";
import { initialClergy } from "../../data/adminContent.js";
import { getClergy, saveClergy } from "../../lib/content.js";
import AdminSection from "./AdminSection.jsx";
import useSectionDraft from "./useSectionDraft.js";
import { FieldLabel, RemoveButton, addButtonClass, inputClass, selectClass } from "./fields.jsx";

/**
 * Doar preoții apar pe site — potrivit specificației nu există alte roluri
 * (cântăreț, paracliser etc.), deci lista de mai jos este tot ce se poate alege.
 */
const ROLE_OPTIONS = ["Preot paroh", "Preot slujitor"];

/** Editor for „Preoți și cler”. */
export default function ClergyEditor({ sectionId, onDirtyChange }) {
  const { draft, setDraft, dirty, discard, reset } = useSectionDraft(initialClergy);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getClergy()
      .then((data) => {
        if (active && data) reset(data.members);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reset]);

  useEffect(() => {
    onDirtyChange(sectionId, dirty);
  }, [dirty, onDirtyChange, sectionId]);

  const error = draft.some((person) => !person.name.trim())
    ? "Fiecare preot trebuie să aibă un nume."
    : "";

  function updatePerson(id, patch) {
    setDraft(draft.map((person) => (person.id === id ? { ...person, ...patch } : person)));
  }

  async function handleSave() {
    const saved = await saveClergy(draft);
    reset(saved.members);
  }

  return (
    <AdminSection
      id={sectionId}
      kicker="Slujitorii altarului"
      title="Preoți și cler"
      description="Pe site apar doar preoții parohiei — preot paroh și preot slujitor (fără cântăreț, paracliser sau alți slujitori)."
      dirty={dirty}
      error={error}
      loading={loading}
      onSave={handleSave}
      onDiscard={discard}
    >
      <div className="flex flex-col gap-4">
        {draft.length === 0 && (
          <p className="text-[14.5px] text-stone">
            Nu există preoți în listă. Adăugați primul preot mai jos.
          </p>
        )}

        {draft.map((person) => (
          <div
            key={person.id}
            className="flex flex-wrap items-end gap-4 rounded-md border border-ink/12 bg-paper p-5"
          >
            <label className="min-w-[220px] flex-1">
              <FieldLabel>Numele</FieldLabel>
              <input
                type="text"
                value={person.name}
                maxLength={80}
                placeholder="ex. Pr. Ioan Popescu"
                onChange={(event) => updatePerson(person.id, { name: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="w-[200px]">
              <FieldLabel>Rolul</FieldLabel>
              <select
                value={person.role}
                onChange={(event) => updatePerson(person.id, { role: event.target.value })}
                className={selectClass}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <RemoveButton
              label={`Șterge „${person.name.trim() || "preot fără nume"}”`}
              onClick={() => setDraft(draft.filter((p) => p.id !== person.id))}
              className="mb-1.5"
            />
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={() =>
              setDraft([
                ...draft,
                { id: crypto.randomUUID(), name: "", role: "Preot slujitor" },
              ])
            }
            className={addButtonClass}
          >
            ＋ Adaugă preot
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
