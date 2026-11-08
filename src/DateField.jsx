import { useEffect, useRef, useState } from "react";
import { formatDMY, parseDMY } from "./dateUtils.js";

// Keep only digits and re-insert the dashes: "08112026" -> "08-11-2026"
function mask(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "-" + digits.slice(2, 4);
  if (digits.length > 4) out += "-" + digits.slice(4);
  return out;
}

// Always shows and accepts dd-mm-yyyy, whatever the browser's language is.
// `value` and `onChange` use ISO "YYYY-MM-DD" strings.
export default function DateField({ id, value, onChange, ariaLabel }) {
  const [text, setText] = useState(formatDMY(value));
  const pickerRef = useRef(null);

  useEffect(() => {
    setText(formatDMY(value));
  }, [value]);

  const handleChange = (e) => {
    const next = mask(e.target.value);
    setText(next);
    const iso = parseDMY(next);
    if (iso) onChange(iso);
  };

  // If the typed date is incomplete or not a real date, go back to the last valid one
  const handleBlur = () => setText(formatDMY(value));

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click();
    }
  };

  const invalid = text.length === 10 && !parseDMY(text);

  return (
    <div className="date-field">
      <input
        id={id}
        type="text"
        className="date-input"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd-mm-yyyy"
        maxLength={10}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-invalid={invalid ? "true" : undefined}
      />
      <button
        type="button"
        className="cal-btn"
        onClick={openPicker}
        aria-label="Open calendar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
      <input
        ref={pickerRef}
        type="date"
        className="native-date"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
      />
    </div>
  );
}
