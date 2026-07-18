import { useEffect, useState } from "react";
import { getGallery, saveGallery, uploadGalleryImages } from "../../lib/content.js";
import AdminSection from "./AdminSection.jsx";
import useSectionDraft from "./useSectionDraft.js";
import { inputClass } from "./fields.jsx";

export const MAX_IMAGES = 20;
const MAX_FILE_MB = 10;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Editor for „Galerie foto”.
 *
 * Files are validated on the client (JPG/PNG/WebP, ≤ 10 MB) and uploaded
 * immediately to the backend, which stores the bytes in Cloudflare R2 under a
 * UUID name and persists the reference in MongoDB + Redis — an uploaded image
 * is therefore already „saved”. The section's „Salvează” button covers the
 * rest: captions, order and deletions.
 */
export default function GalleryEditor({ sectionId, onDirtyChange }) {
  // Starts empty: the real gallery is whatever the server has (placeholder
  // images shown on the public page are not server objects).
  const { draft, setDraft, setSaved, dirty, discard, reset } = useSectionDraft([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    getGallery()
      .then((data) => {
        if (active && data) reset(data.images);
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

  async function handleFiles(event) {
    const files = [...event.target.files];
    event.target.value = "";
    if (!files.length) return;

    // Client-side validation: image type + size, before any bytes leave the
    // device (the backend re-checks both).
    const valid = files.filter(
      (file) => ACCEPTED_TYPES.has(file.type) && file.size <= MAX_FILE_MB * 1024 * 1024,
    );
    const rejectedCount = files.length - valid.length;

    const remaining = MAX_IMAGES - draft.length;
    const accepted = valid.slice(0, Math.max(0, remaining));
    const overflowCount = valid.length - accepted.length;

    const problems = [];
    if (rejectedCount > 0) {
      problems.push(
        `${rejectedCount} ${rejectedCount === 1 ? "fișier respins" : "fișiere respinse"} (doar JPG, PNG sau WebP, cel mult ${MAX_FILE_MB} MB)`,
      );
    }
    if (overflowCount > 0) {
      problems.push(`limita este de ${MAX_IMAGES} de imagini`);
    }

    if (!accepted.length) {
      setNotice(problems.join("; ") + ".");
      return;
    }

    setUploading(true);
    setNotice("");
    try {
      const response = await uploadGalleryImages(accepted);
      // The server already persisted these — they join the saved state too,
      // so uploading alone never leaves the section „dirty”.
      setSaved((prev) => [...prev, ...response.images]);
      setDraft((prev) => [...prev, ...response.images]);
      const okMessage =
        response.images.length === 1
          ? "O imagine a fost încărcată."
          : `${response.images.length} imagini au fost încărcate.`;
      setNotice([okMessage, ...problems].join(" ") + (problems.length ? "." : ""));
    } catch (error) {
      setNotice(error?.message || "Încărcarea a eșuat. Încercați din nou.");
    } finally {
      setUploading(false);
    }
  }

  function updateCaption(id, caption) {
    setDraft(draft.map((item) => (item.id === id ? { ...item, caption } : item)));
  }

  async function handleSave() {
    const saved = await saveGallery(
      draft.map(({ id, url, caption }) => ({ id, url, caption })),
    );
    reset(saved.images);
  }

  return (
    <AdminSection
      id={sectionId}
      kicker="Priveliști ale locașului"
      title="Galerie foto"
      description={`Fotografiile din galeria paginii principale — cel mult ${MAX_IMAGES} de imagini (JPG, PNG sau WebP, până în ${MAX_FILE_MB} MB). Imaginile se încarcă imediat; descrierile, ordinea și ștergerile se aplică la „Salvează modificările”.`}
      dirty={dirty}
      loading={loading}
      onSave={handleSave}
      onDiscard={() => {
        setNotice("");
        discard();
      }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[14px] text-ink-mute tabular-nums">
          <span className="font-semibold text-ink">{draft.length}</span> / {MAX_IMAGES} imagini
        </div>
        {notice && <p className="max-w-[540px] text-[13.5px] text-burgundy">{notice}</p>}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        {draft.map((item) => (
          <figure key={item.id} className="relative m-0 rounded-md border border-ink/12 bg-paper p-3">
            <img
              src={item.url}
              alt={item.caption || "Imagine din galerie"}
              className="aspect-[4/3] w-full rounded object-cover"
            />
            <button
              type="button"
              aria-label="Șterge imaginea"
              title="Șterge imaginea (se aplică la salvare)"
              onClick={() => setDraft(draft.filter((img) => img.id !== item.id))}
              className="absolute top-1.5 right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-night/60 text-[15px] leading-none text-cream backdrop-blur-[3px] transition-colors duration-300 hover:bg-burgundy"
            >
              ×
            </button>
            <input
              type="text"
              value={item.caption}
              maxLength={120}
              placeholder="Descriere scurtă (opțional)"
              aria-label="Descrierea imaginii"
              onChange={(event) => updateCaption(item.id, event.target.value)}
              className={`${inputClass} mt-3 px-3 py-2 text-[13.5px]`}
            />
          </figure>
        ))}

        {draft.length < MAX_IMAGES && (
          <label
            className={`flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-stone transition-colors duration-300 ${
              uploading
                ? "cursor-wait border-bronze/60 text-bronze"
                : "cursor-pointer border-ink/25 hover:border-bronze hover:text-bronze"
            }`}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={handleFiles}
              className="hidden"
            />
            {uploading ? (
              <>
                <span className="font-heading text-[22px] leading-none">…</span>
                <span className="text-[14px]">Se încarcă imaginile</span>
              </>
            ) : (
              <>
                <span className="font-heading text-[34px] leading-none">＋</span>
                <span className="text-[14px]">Încarcă imagini</span>
                <span className="text-[12px] text-stone/80">
                  încă {MAX_IMAGES - draft.length} disponibile
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {draft.length === 0 && !loading && (
        <p className="mt-4 text-[14.5px] text-stone">
          Galeria este goală — încărcați imagini de pe dispozitiv. Până la prima
          încărcare, pagina publică afișează imaginile implicite.
        </p>
      )}
    </AdminSection>
  );
}
