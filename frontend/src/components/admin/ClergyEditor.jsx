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

const MIN_YEAR = 1700;
const MAX_YEAR = 2100;

/** Same rule as the backend: an end year needs a start year and can't precede it. */
function tenureError(person) {
  if (person.current || person.endYear == null) return "";
  if (person.startYear == null) return "Anul de final are nevoie de un an de început.";
  if (person.endYear < person.startYear)
    return "Anul de final nu poate fi înaintea celui de început.";
  return "";
}

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
    : (draft.map(tenureError).find(Boolean) ?? "");

  function updatePerson(id, patch) {
    setDraft(draft.map((person) => (person.id === id ? { ...person, ...patch } : person)));
  }

  // Empty input → null; otherwise the numeric year.
  function updateYear(id, field, raw) {
    updatePerson(id, { [field]: raw === "" ? null : Number(raw) });
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
            <label className="w-[110px]">
              <FieldLabel>Din anul</FieldLabel>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={person.startYear ?? ""}
                placeholder="ex. 1998"
                onChange={(event) => updateYear(person.id, "startYear", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="w-[110px]">
              <FieldLabel>Până în anul</FieldLabel>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={person.current ? "" : (person.endYear ?? "")}
                disabled={person.current}
                placeholder={person.current ? "—" : "ex. 2010"}
                onChange={(event) => updateYear(person.id, "endYear", event.target.value)}
                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </label>
            <label className="mb-2.5 flex cursor-pointer items-center gap-2 text-[14px] text-ink-mute select-none">
              <input
                type="checkbox"
                checked={!!person.current}
                onChange={(event) =>
                  updatePerson(person.id, {
                    current: event.target.checked,
                    ...(event.target.checked ? { endYear: null } : {}),
                  })
                }
                className="h-4 w-4 cursor-pointer accent-burgundy"
              />
              Încă în funcție
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
                {
                  id: crypto.randomUUID(),
                  name: "",
                  role: "Preot slujitor",
                  startYear: null,
                  endYear: null,
                  current: false,
                },
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
