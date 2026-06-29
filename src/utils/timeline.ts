import type { Booking, ItineraryItem } from '@/src/types/api';
import { formatDayKey } from './dates';

export type TimelineEntry =
  | { kind: 'booking'; item: Booking }
  | { kind: 'itinerary'; item: ItineraryItem };

export type TimelineDayGroup = {
  dayKey: string;
  entries: TimelineEntry[];
};

export function groupTimelineEntries(
  bookings: Booking[],
  itineraryItems: ItineraryItem[],
  timezone: string,
): TimelineDayGroup[] {
  const map = new Map<string, TimelineEntry[]>();

  const add = (dayKey: string, entry: TimelineEntry) => {
    const list = map.get(dayKey) ?? [];
    list.push(entry);
    map.set(dayKey, list);
  };

  for (const booking of bookings) {
    if (booking.status === 'rejected') continue;
    const dayKey = formatDayKey(booking.start_at, booking.timezone || timezone);
    add(dayKey, { kind: 'booking', item: booking });
  }

  for (const item of itineraryItems) {
    const dayKey = formatDayKey(`${item.date}T12:00:00`, timezone);
    add(dayKey, { kind: 'itinerary', item });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, entries]) => ({
      dayKey,
      entries: entries.sort((a, b) => {
        const aTime =
          a.kind === 'booking' ? a.item.start_at : `${a.item.date}T${a.item.start_time ?? '00:00'}`;
        const bTime =
          b.kind === 'booking' ? b.item.start_at : `${b.item.date}T${b.item.start_time ?? '00:00'}`;
        return aTime.localeCompare(bTime);
      }),
    }));
}
