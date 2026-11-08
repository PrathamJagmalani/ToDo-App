// Dates are stored as local "YYYY-MM-DD" strings so they never shift with time zones.

const pad = (n) => String(n).padStart(2, "0");

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Monday of the week that contains the given date
export function startOfWeek(iso) {
  const d = parseISO(iso);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return toISO(d);
}

export function weekdayShort(iso) {
  return parseISO(iso).toLocaleDateString(undefined, { weekday: "short" });
}

// "2026-11-08" -> "08-11-2026"
export function formatDMY(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

// "08-11-2026" -> "2026-11-08", or null if it is not a real date
export function parseDMY(text) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1900 || year > 2200) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return toISO(date);
}

export function formatShort(iso) {
  return `${weekdayShort(iso)} ${formatDMY(iso)}`;
}

export function formatLong(iso) {
  return `${weekdayLong(iso)}, ${formatDMY(iso)}`;
}

export function weekdayLong(iso) {
  return parseISO(iso).toLocaleDateString(undefined, { weekday: "long" });
}

export function relativeLabel(iso) {
  const today = todayISO();
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  if (iso === addDays(today, -1)) return "Yesterday";
  return null;
}

// "14:30" -> "2:30 PM" (or 24h, depending on the user's locale)
export function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
