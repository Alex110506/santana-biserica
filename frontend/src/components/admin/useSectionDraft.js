import { useCallback, useMemo, useState } from "react";

/**
 * Draft state for one editable dashboard section.
 *
 * Holds the last-saved value and a working draft; `save` commits the draft,
 * `discard` restores the saved value, `reset` replaces both (used when the
 * server's canonical payload arrives — on load and after a successful save).
 * Values must be JSON-serialisable — dirtiness is a structural comparison, so
 * replace (don't mutate) nested arrays/objects when updating the draft.
 */
export default function useSectionDraft(initial) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const save = useCallback(() => {
    setSaved(draft);
  }, [draft]);

  const discard = useCallback(() => {
    setDraft(saved);
  }, [saved]);

  const reset = useCallback((value) => {
    setSaved(value);
    setDraft(value);
  }, []);

  return { draft, setDraft, saved, setSaved, dirty, save, discard, reset };
}
