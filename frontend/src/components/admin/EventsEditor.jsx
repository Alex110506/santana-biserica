import { useEffect, useMemo, useState } from "react";
import { initialEvents } from "../../data/adminContent.js";
import { getEvents, saveEvents } from "../../lib/content.js";
import { eventSortKey, formatRoLong, parseISODate, roMonthName } from "../../lib/dates.js";
import AdminSection from "./AdminSection.jsx";
import useSectionDraft from "./useSectionDraft.js";
import { FieldLabel, inputClass } from "./fields.jsx";

const EMPTY_FORM = { date: "", time: "", title: "", desc: "" };

/**
 * Editor for „Anunțuri și evenimente”: evenimente adăugate după dată.
 *
 * Intrările cu `source: "calendar"` vor veni automat din scraperul de calendar
 * ortodox — aici sunt doar afișate (nu pot fi modificate sau șterse), ca să se
 * vadă cum coexistă cu evenimentele adăugate de mână. Lista derulează separat,
 * deci oricâte evenimente ar exista, pagina nu se strică.
 */
export default function EventsEditor({ sectionId, onDirtyChange }) {
  const { draft, setDraft, dirty, discard, reset } = useSectionDraft(initialEvents);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getEvents()
      .then((data) => {
        if (active && data) reset(data.events);
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

  const sorted = useMemo(
    () => [...draft].sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b))),
    [draft],
  );

  const currentYear = new Date().getFullYear();
  const canAdd = Boolean(form.date && form.title.trim());

  function handleAdd() {
    if (!canAdd) return;
    setDraft([
      ...draft,
      {
        id: crypto.randomUUID(),
        date: form.date,
        time: form.time || "",
        title: form.title.trim(),
        desc: form.desc.trim(),
        source: "manual",
        holiday: false,
      },
    ]);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    const saved = await saveEvents(draft);
    reset(saved.events);
  }

  return (
    <AdminSection
      id={sectionId}
      kicker="Viața parohiei"
      title="Anunțuri și evenimente"
      description="Evenimente legate de o dată din calendar. Sărbătorile marcate „Calendar ortodox” sunt aduse automat de sistem și nu se pot modifica de aici; zilele cu roșu din calendar (sărbătorile importante) apar cu data în roșu, iar anunțurile parohiei cu data în negru. Publicul vede evenimentele din următoarele 30 de zile, 90 de zile sau un an."
      dirty={dirty}
      loading={loading}
      onSave={handleSave}
      onDiscard={() => {
        setForm(EMPTY_FORM);
        discard();
      }}
    >
      {/* Formular de adăugare */}
      <div className="mb-7 rounded-md border border-ink/12 bg-paper p-5">
        <div className="mb-4 text-[13px] tracking-[.14em] text-stone uppercase">
          Adaugă un eveniment
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="w-[170px]">
            <FieldLabel>Data</FieldLabel>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className="w-[120px]">
            <FieldLabel>Ora (opțional)</FieldLabel>
            <input
              type="time"
              value={form.time}
              onChange={(event) => setForm({ ...form, time: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className="min-w-[220px] flex-1">
            <FieldLabel>Titlul evenimentului</FieldLabel>
            <input
              type="text"
              value={form.title}
              maxLength={90}
              placeholder="ex. Pelerinaj, concert de colinde, colectă…"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className={inputClass}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <FieldLabel>Descriere (opțional)</FieldLabel>
          <textarea
            rows={2}
            value={form.desc}
            maxLength={220}
            placeholder="Câteva detalii pentru credincioși…"
            onChange={(event) => setForm({ ...form, desc: event.target.value })}
            className={`${inputClass} resize-y`}
          />
        </label>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="cursor-pointer rounded border border-bronze-deep/50 bg-bronze px-5 py-2.5 text-[14.5px] text-cream transition-colors duration-300 hover:bg-bronze-deep disabled:cursor-not-allowed disabled:opacity-45"
          >
            ＋ Adaugă eveniment
          </button>
        </div>
      </div>

      {/* Lista evenimentelor — derulabilă separat, ca să nu rupă pagina */}
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <FieldLabel className="mb-0">Evenimente programate</FieldLabel>
        <span className="text-[13px] text-stone tabular-nums">
          {sorted.length} {sorted.length === 1 ? "eveniment" : "evenimente"}
        </span>
      </div>

      <div className="scroll-panel max-h-[480px] overflow-y-auto rounded-md border border-ink/12 bg-paper px-5">
        {sorted.length === 0 && (
          <p className="py-6 text-[14.5px] text-stone">
            Nu există evenimente. Adăugați unul folosind formularul de mai sus.
          </p>
        )}

        {sorted.map((event, index) => {
          const date = parseISODate(event.date);
          const auto = event.source === "calendar";
          return (
            <div
              key={event.id}
              className={`grid grid-cols-[76px_1fr] gap-5 py-5 ${index > 0 ? "border-t border-ink/10" : ""}`}
            >
              <div className="text-center" title={formatRoLong(event.date)}>
                <div
                  className={`font-heading text-[30px] leading-none tabular-nums ${
                    event.holiday ? "text-burgundy" : "text-ink"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="mt-1 text-[10.5px] tracking-[.12em] text-stone uppercase">
                  {roMonthName(event.date)}
                </div>
                {date.getFullYear() !== currentYear && (
                  <div className="text-[10.5px] text-stone/80 tabular-nums">
                    {date.getFullYear()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="font-heading text-[19px] leading-[1.25] text-ink">
                    {event.title}
                  </span>
                  {event.time && (
                    <span className="text-[13px] whitespace-nowrap text-burgundy tabular-nums">
                      ora {event.time}
                    </span>
                  )}
                  {auto ? (
                    <span className="rounded-full border border-gold/60 bg-gold/10 px-2.5 py-0.5 text-[10.5px] tracking-[.08em] text-bronze-deep uppercase">
                      Calendar ortodox
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDraft(draft.filter((e) => e.id !== event.id))}
                      className="cursor-pointer text-[13px] text-stone underline decoration-transparent underline-offset-2 transition-colors duration-250 hover:text-burgundy hover:decoration-burgundy"
                    >
                      Șterge
                    </button>
                  )}
                </div>
                {event.desc && (
                  <p className="mt-1 text-[14px] leading-[1.6] text-ink-mute">{event.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminSection>
  );
}
