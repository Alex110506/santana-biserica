import { useEffect, useState } from "react";
import { initialSchedule } from "../../data/adminContent.js";
import { getSchedule, saveSchedule } from "../../lib/content.js";
import { RO_DAYS } from "../../lib/dates.js";
import AdminSection from "./AdminSection.jsx";
import useSectionDraft from "./useSectionDraft.js";
import { FieldLabel, RemoveButton, addButtonClass, inputClass, selectClass } from "./fields.jsx";

/** Week shown Monday-first (values are `Date.getDay()` numbers). */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** „A câta” apariție din lună — for monthly services („prima vineri din lună”). */
const ORDINALS = ["prima", "a doua", "a treia", "a patra", "ultima"];

function newItem() {
  return {
    id: crypto.randomUUID(),
    name: "",
    time: "08:00",
    frequency: "weekly",
    days: [],
    ordinal: "prima",
    weekday: 0,
  };
}

/** Human summary shown under each row („Săptămânal — Duminică, ora 10:00”). */
function describeItem(item) {
  if (item.frequency === "monthly") {
    return `Lunar — ${item.ordinal} ${RO_DAYS[item.weekday].toLowerCase()} din lună, ora ${item.time}`;
  }
  const names = WEEK_ORDER.filter((day) => item.days.includes(day)).map(
    (day) => RO_DAYS[day],
  );
  if (!names.length) return "Alegeți cel puțin o zi din săptămână.";
  return `Săptămânal — ${names.join(", ")}, ora ${item.time}`;
}

function validate(items) {
  for (const item of items) {
    const name = item.name.trim();
    if (!name) return "Fiecare slujbă trebuie să aibă o denumire.";
    if (!item.time) return `Alegeți ora pentru „${name}”.`;
    if (item.frequency === "weekly" && item.days.length === 0) {
      return `Alegeți cel puțin o zi din săptămână pentru „${name}”.`;
    }
  }
  return "";
}

/**
 * Editor for „Rânduiala săptămânii”: fiecare slujbă are o oră de început și se
 * repetă fie săptămânal (una sau mai multe zile), fie lunar (o singură dată —
 * cadenta minimă admisă).
 */
export default function ScheduleEditor({ sectionId, onDirtyChange }) {
  const { draft, setDraft, dirty, discard, reset } = useSectionDraft(initialSchedule);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSchedule()
      .then((data) => {
        if (active && data) reset(data.items);
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

  const error = validate(draft);

  function updateItem(id, patch) {
    setDraft(draft.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function toggleDay(item, day) {
    const days = item.days.includes(day)
      ? item.days.filter((d) => d !== day)
      : [...item.days, day];
    updateItem(item.id, { days });
  }

  async function handleSave() {
    const saved = await saveSchedule(draft);
    reset(saved.items);
  }

  return (
    <AdminSection
      id={sectionId}
      kicker="Programul slujbelor"
      title="Rânduiala săptămânii"
      description="Slujbele care se repetă: săptămânal (în una sau mai multe zile) sau lunar (cel mult o dată pe lună — nu există rânduieli mai rare de atât)."
      dirty={dirty}
      error={error}
      loading={loading}
      onSave={handleSave}
      onDiscard={discard}
    >
      <div className="flex flex-col gap-5">
        {draft.length === 0 && (
          <p className="text-[14.5px] text-stone">
            Nu există slujbe în program. Adăugați prima slujbă mai jos.
          </p>
        )}

        {draft.map((item) => (
          <div key={item.id} className="rounded-md border border-ink/12 bg-paper p-5">
            <div className="flex flex-wrap items-end gap-4">
              <label className="min-w-[220px] flex-1">
                <FieldLabel>Slujba</FieldLabel>
                <input
                  type="text"
                  value={item.name}
                  maxLength={80}
                  placeholder="ex. Sfânta Liturghie, Vecernia, Acatistul…"
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="w-[120px]">
                <FieldLabel>Ora</FieldLabel>
                <input
                  type="time"
                  value={item.time}
                  onChange={(event) => updateItem(item.id, { time: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="w-[150px]">
                <FieldLabel>Frecvența</FieldLabel>
                <select
                  value={item.frequency}
                  onChange={(event) => updateItem(item.id, { frequency: event.target.value })}
                  className={selectClass}
                >
                  <option value="weekly">Săptămânal</option>
                  <option value="monthly">Lunar</option>
                </select>
              </label>
              <RemoveButton
                label={`Șterge slujba „${item.name.trim() || "fără nume"}”`}
                onClick={() => setDraft(draft.filter((it) => it.id !== item.id))}
                className="mb-1.5"
              />
            </div>

            {item.frequency === "weekly" ? (
              <div className="mt-4">
                <FieldLabel>Zilele săptămânii</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {WEEK_ORDER.map((day) => {
                    const active = item.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleDay(item, day)}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors duration-250 ${
                          active
                            ? "border-burgundy bg-burgundy text-cream"
                            : "border-ink/20 text-ink-mute hover:border-burgundy/60 hover:text-burgundy"
                        }`}
                      >
                        {RO_DAYS[day]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <label className="w-[150px]">
                  <FieldLabel>Săptămâna din lună</FieldLabel>
                  <select
                    value={item.ordinal}
                    onChange={(event) => updateItem(item.id, { ordinal: event.target.value })}
                    className={selectClass}
                  >
                    {ORDINALS.map((ordinal) => (
                      <option key={ordinal} value={ordinal}>
                        {ordinal.charAt(0).toUpperCase() + ordinal.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="w-[150px]">
                  <FieldLabel>Ziua</FieldLabel>
                  <select
                    value={item.weekday}
                    onChange={(event) =>
                      updateItem(item.id, { weekday: Number(event.target.value) })
                    }
                    className={selectClass}
                  >
                    {WEEK_ORDER.map((day) => (
                      <option key={day} value={day}>
                        {RO_DAYS[day]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="pb-2.5 text-[14px] text-ink-mute">din lună</div>
              </div>
            )}

            <p className="mt-3.5 border-t border-ink/8 pt-3 text-[13px] text-stone italic">
              {describeItem(item)}
            </p>
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={() => setDraft([...draft, newItem()])}
            className={addButtonClass}
          >
            ＋ Adaugă slujbă
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
