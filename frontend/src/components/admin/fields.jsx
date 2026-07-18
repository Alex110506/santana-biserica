/** Shared form styles and small controls for the admin editors. */

export const inputClass =
  "w-full rounded border border-ink/20 bg-cream px-3.5 py-2.5 text-[15px] text-ink " +
  "transition-colors duration-300 placeholder:text-stone/70 focus:border-bronze";

export const selectClass =
  "w-full cursor-pointer rounded border border-ink/20 bg-cream px-3 py-2.5 text-[15px] " +
  "text-ink transition-colors duration-300 focus:border-bronze";

export const addButtonClass =
  "cursor-pointer rounded border border-dashed border-ink/30 px-5 py-2.5 text-[14.5px] " +
  "text-ink-mute transition-colors duration-300 hover:border-bronze hover:text-bronze";

/** Small-caps field label, matching the login form. */
export function FieldLabel({ children, className = "" }) {
  return (
    <span
      className={`mb-1.5 block text-[10.5px] tracking-[.18em] text-burgundy uppercase ${className}`}
    >
      {children}
    </span>
  );
}

/** Round „×” used to remove a row/an image. */
export function RemoveButton({ label, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full " +
        "border border-ink/20 text-[15px] leading-none text-stone transition-colors " +
        `duration-300 hover:border-burgundy hover:bg-burgundy hover:text-cream ${className}`
      }
    >
      ×
    </button>
  );
}
