import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Minimal „docs-like” rich text editor (contentEditable).
 *
 * Deliberately tiny instead of a library: the admin may only bold / italicise /
 * underline text — never change font, size or colour — so the whole surface is
 * a whitelist. Everything else is stripped:
 *  - paste and drop are forced to plain text;
 *  - the emitted HTML is sanitised to b/strong, i/em, u, br, p, div (no
 *    attributes), so no style/font markup can survive;
 *  - a hard character limit (`maxChars`) counts plain text, not markup.
 *
 * Uses `document.execCommand` — deprecated but universally supported and the
 * only dependency-free way to toggle inline formatting. Swap for TipTap if the
 * needs ever outgrow bold/italic/underline. The backend must re-sanitise on
 * save regardless (client-side sanitising is UX, not security).
 */

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "P", "DIV", "BR"]);

/** Rebuild `source`'s children into `target`, keeping only whitelisted tags. */
function copySanitized(source, target) {
  source.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(child.textContent));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    if (!ALLOWED_TAGS.has(child.tagName)) {
      // Unknown element (span, font…) — drop the wrapper, keep its content.
      copySanitized(child, target);
      return;
    }
    const clean = document.createElement(child.tagName.toLowerCase());
    target.appendChild(clean);
    copySanitized(child, clean);
  });
}

function sanitizeHtml(element) {
  const out = document.createElement("div");
  copySanitized(element, out);
  return out.innerHTML;
}

/** Characters still available, counting a selection as about-to-be-replaced. */
function remainingChars(el, maxChars) {
  if (!el) return 0;
  const selection = document.getSelection();
  let selectedLength = 0;
  if (selection?.rangeCount && selection.anchorNode && el.contains(selection.anchorNode)) {
    selectedLength = selection.getRangeAt(0).toString().length;
  }
  return maxChars - el.textContent.length + selectedLength;
}

const TOOLBAR_BUTTONS = [
  { command: "bold", label: "B", title: "Aldin (Ctrl+B)", style: "font-bold" },
  { command: "italic", label: "I", title: "Cursiv (Ctrl+I)", style: "italic" },
  { command: "underline", label: "U", title: "Subliniat (Ctrl+U)", style: "underline" },
];

export default function RichTextEditor({
  value,
  onChange,
  maxChars,
  placeholder = "",
  ariaLabel = "Editor de text",
}) {
  const editorRef = useRef(null);
  // Last HTML we emitted — lets the value-sync effect tell „echo of our own
  // change” (skip) apart from an external reset like Discard (apply).
  const lastEmitted = useRef(null);
  const [count, setCount] = useState(0);
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });

  // Emit <b>/<i>/<u> tags rather than styled <span>s.
  useEffect(() => {
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch {
      /* older engines — tag output is already their default */
    }
  }, []);

  // Apply external value changes (initial content, Discard) into the DOM,
  // before paint so the initial content never flashes empty.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el || value === lastEmitted.current) return;
    el.innerHTML = value || "";
    lastEmitted.current = value || "";
    setCount(el.textContent.length);
  }, [value]);

  // Enforce the character limit with a NATIVE beforeinput listener — React's
  // synthetic onBeforeInput is polyfilled in some engines and loses inputType.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    function handleBeforeInput(event) {
      const inputType = event.inputType || "";
      // Deletions and format toggles are always allowed.
      if (!inputType.startsWith("insert")) return;
      // Paste is fully handled (plain-texted + clamped) in the paste handler.
      if (inputType === "insertFromPaste") return;

      const remaining = remainingChars(el, maxChars);
      if (inputType === "insertParagraph" || inputType === "insertLineBreak") {
        if (remaining <= 0) event.preventDefault();
        return;
      }

      const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
      if (text.length > remaining) {
        event.preventDefault();
        if (remaining > 0) {
          document.execCommand("insertText", false, text.slice(0, remaining));
        }
      }
    }

    el.addEventListener("beforeinput", handleBeforeInput);
    return () => el.removeEventListener("beforeinput", handleBeforeInput);
  }, [maxChars]);

  // Toolbar button states follow the caret / selection.
  useEffect(() => {
    function updateFormats() {
      const el = editorRef.current;
      const selection = document.getSelection();
      if (!el || !selection?.anchorNode || !el.contains(selection.anchorNode)) return;
      setFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    }
    document.addEventListener("selectionchange", updateFormats);
    return () => document.removeEventListener("selectionchange", updateFormats);
  }, []);

  function emit() {
    const el = editorRef.current;
    if (!el) return;
    const html = sanitizeHtml(el);
    const plainLength = el.textContent.length;
    lastEmitted.current = html;
    setCount(plainLength);
    onChange(html, plainLength);
  }

  function handlePaste(event) {
    // Always paste as plain text, clamped to the limit — keeps foreign fonts,
    // colours and sizes out of the content.
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const remaining = remainingChars(editorRef.current, maxChars);
    if (remaining <= 0 || !text) return;
    document.execCommand("insertText", false, text.slice(0, remaining));
  }

  function runCommand(command) {
    editorRef.current?.focus();
    document.execCommand(command);
    emit();
  }

  const nearLimit = count > maxChars - 40;

  return (
    <div className="overflow-hidden rounded border border-ink/20 bg-cream transition-colors duration-300 focus-within:border-bronze">
      <div className="flex items-center gap-1 border-b border-ink/10 bg-paper px-2 py-1.5">
        {TOOLBAR_BUTTONS.map((button) => (
          <button
            key={button.command}
            type="button"
            title={button.title}
            aria-label={button.title}
            aria-pressed={formats[button.command]}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(button.command)}
            className={`h-8 w-8 cursor-pointer rounded font-heading text-[16px] transition-colors duration-200 ${button.style} ${
              formats[button.command]
                ? "bg-burgundy text-cream"
                : "text-ink-mute hover:bg-ink/8 hover:text-ink"
            }`}
          >
            {button.label}
          </button>
        ))}
        <div className="mx-1.5 h-5 w-px bg-ink/15" />
        <button
          type="button"
          title="Elimină formatarea din selecție"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("removeFormat")}
          className="cursor-pointer rounded px-2.5 py-1.5 text-[12.5px] text-ink-mute transition-colors duration-200 hover:bg-ink/8 hover:text-ink"
        >
          Elimină formatarea
        </button>
        <div
          className={`ml-auto pr-2 text-[12.5px] tabular-nums ${
            nearLimit ? "text-burgundy" : "text-stone"
          }`}
        >
          {count} / {maxChars}
        </div>
      </div>

      <div className="relative">
        {count === 0 && placeholder && (
          <div className="pointer-events-none absolute top-3.5 left-4 text-[15.5px] text-stone/60">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onPaste={handlePaste}
          onDrop={(event) => event.preventDefault()}
          className="min-h-[170px] px-4 py-3.5 text-[15.5px] leading-[1.8] text-ink outline-none"
        />
      </div>
    </div>
  );
}
