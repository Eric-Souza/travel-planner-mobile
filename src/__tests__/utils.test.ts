import { parseSseChunk } from '@/src/api/chat';
import { mapToolResultFromSse } from '@/src/api/mappers';
import { groupTimelineEntries } from '@/src/utils/timeline';
import { formatDayKey } from '@/src/utils/dates';
import type { Booking, ItineraryItem } from '@/src/types/api';

describe('parseSseChunk', () => {
  it('parses status and token events', () => {
    const buffer =
      'event: status\ndata: {"message":"Searching"}\n\nevent: token\ndata: {"text":"Hello"}\n\n';
    const { events, remainder } = parseSseChunk(buffer);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ event: 'status', data: { message: 'Searching' } });
    expect(events[1]).toEqual({ event: 'token', data: { text: 'Hello' } });
    expect(remainder).toBe('');
  });

  it('keeps incomplete blocks in remainder', () => {
    const buffer = 'event: token\ndata: {"text":"Hi"}\n\nevent: token\n';
    const { events, remainder } = parseSseChunk(buffer);
    expect(events).toHaveLength(1);
    expect(remainder).toContain('event: token');
  });
});

describe('groupTimelineEntries', () => {
  const bookings: Booking[] = [
    {
      id: '1',
      trip_id: 't1',
      type: 'hotel',
      title: 'Hotel',
      start_at: '2026-08-01T15:00:00-03:00',
      end_at: '2026-08-04T11:00:00-03:00',
      timezone: 'America/Argentina/Buenos_Aires',
      status: 'confirmed',
      created_at: '',
      updated_at: '',
    },
  ];

  const items: ItineraryItem[] = [
    {
      id: '2',
      trip_id: 't1',
      date: '2026-08-02',
      title: 'Market',
      status: 'suggested',
    },
  ];

  it('groups by day and excludes rejected bookings', () => {
    const rejected: Booking = { ...bookings[0], id: 'r', status: 'rejected' };
    const groups = groupTimelineEntries(
      [...bookings, rejected],
      items,
      'America/Argentina/Buenos_Aires',
    );
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const allBookings = groups.flatMap((g) =>
      g.entries.filter((e) => e.kind === 'booking'),
    );
    expect(allBookings).toHaveLength(1);
  });
});

describe('mapToolResultFromSse', () => {
  it('maps weather tool results', () => {
    const card = mapToolResultFromSse({
      tool: 'get_weather',
      result: {
        condition: 'Rain',
        temperature_low: 10,
        temperature_high: 15,
        fetched_at: '2026-08-06T12:00:00Z',
      },
    });
    expect(card.title).toBe('Weather');
    expect(card.summary).toContain('Rain');
  });
});
