/** The three-barred cross mark used in the navbar, clergy cards and footer. */
export default function CrossIcon({ className = "" }) {
  return (
    <svg
      width="22"
      height="30"
      viewBox="0 0 22 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      aria-hidden="true"
    >
      <line x1="11" y1="2" x2="11" y2="29" />
      <line x1="5" y1="8" x2="17" y2="8" />
      <line x1="2.5" y1="13.5" x2="19.5" y2="13.5" />
      <line x1="5.5" y1="21" x2="16.5" y2="19" />
    </svg>
  );
}
