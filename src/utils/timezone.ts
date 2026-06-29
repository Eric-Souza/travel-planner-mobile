/**
 * Lightweight timezone formatting without extra dependencies.
 * Uses Intl when available; falls back to local display.
 */
export function formatInTimeZone(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(
      new Date(iso),
    );
  } catch {
    return new Date(iso).toLocaleString(undefined, options);
  }
}

export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
