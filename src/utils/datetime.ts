/** Format a Date as YYYY-MM-DD (local calendar date). */
export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to local Date at midnight. */
export function parseDateOnly(value: string | undefined): Date | undefined {
  if (!value?.match(/^\d{4}-\d{2}-\d{2}$/)) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Parse ISO datetime string to Date. */
export function parseIsoDateTime(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Combine local date + time into ISO string. */
export function combineDateAndTime(date: Date, hours: number, minutes: number): string {
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export function getTimeParts(iso: string | undefined): { hours: number; minutes: number } {
  const d = parseIsoDateTime(iso);
  if (!d) return { hours: 12, minutes: 0 };
  return { hours: d.getHours(), minutes: d.getMinutes() };
}

export function formatTimeLabel(hours: number, minutes: number): string {
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`;
}
