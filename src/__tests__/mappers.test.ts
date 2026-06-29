import {
  joinCommaList,
  mapBookingFromApi,
  mapPreferenceFromApi,
  mapPreferenceToApi,
  normalizeChatStreamEvent,
  parseJsonStringArray,
  splitCommaList,
  toTripDatetime,
} from '@/src/api/mappers';

describe('splitCommaList / joinCommaList', () => {
  it('splits comma-separated API strings', () => {
    expect(splitCommaList('food, wine, tango')).toEqual(['food', 'wine', 'tango']);
    expect(splitCommaList(null)).toEqual([]);
    expect(splitCommaList('  ')).toEqual([]);
  });

  it('joins arrays for API updates', () => {
    expect(joinCommaList(['a', 'b'])).toBe('a, b');
    expect(joinCommaList([])).toBeUndefined();
    expect(joinCommaList(undefined)).toBeUndefined();
  });
});

describe('parseJsonStringArray', () => {
  it('parses JSON array strings from booking uncertainty_notes', () => {
    expect(parseJsonStringArray('["late checkout","room type unclear"]')).toEqual([
      'late checkout',
      'room type unclear',
    ]);
  });

  it('falls back to a single string when JSON is invalid', () => {
    expect(parseJsonStringArray('manual note')).toEqual(['manual note']);
    expect(parseJsonStringArray(null)).toEqual([]);
  });
});

describe('mapPreferenceFromApi / mapPreferenceToApi', () => {
  const apiPref = {
    trip_id: 'trip-1',
    budget_level: 'moderate',
    pace: 'relaxed',
    interests: 'museums, food',
    food_preferences: 'vegetarian',
    nightlife_interest: 2,
    hiking_interest: 1,
    skiing_interest: 0,
    max_walking_minutes: 20,
    preferred_start_time: '09:00',
    notes: 'Avoid crowds',
  };

  it('round-trips comma-separated preference fields', () => {
    const mapped = mapPreferenceFromApi(apiPref);
    expect(mapped.interests).toEqual(['museums', 'food']);
    expect(mapped.food_preferences).toEqual(['vegetarian']);

    const back = mapPreferenceToApi(mapped);
    expect(back.interests).toBe('museums, food');
    expect(back.food_preferences).toBe('vegetarian');
  });
});

describe('mapBookingFromApi', () => {
  it('maps uncertainty_notes from JSON string', () => {
    const booking = mapBookingFromApi({
      id: 'b1',
      trip_id: 't1',
      type: 'flight',
      title: 'EZE → BRC',
      start_at: '2026-08-05T08:00:00Z',
      end_at: '2026-08-05T10:00:00Z',
      timezone: 'America/Argentina/Buenos_Aires',
      status: 'confirmed',
      uncertainty_notes: '["gate TBD"]',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(booking.uncertainty_notes).toEqual(['gate TBD']);
  });
});

describe('toTripDatetime', () => {
  it('appends midnight Z for date-only strings', () => {
    expect(toTripDatetime('2026-08-01')).toBe('2026-08-01T00:00:00Z');
    expect(toTripDatetime('2026-08-01T12:00:00Z')).toBe('2026-08-01T12:00:00Z');
  });
});

describe('normalizeChatStreamEvent', () => {
  it('maps tool_result SSE payloads', () => {
    const event = normalizeChatStreamEvent('tool_result', {
      tool: 'get_weather',
      result: { condition: 'Sunny', temperature_high: 22, temperature_low: 15 },
    });
    expect(event?.event).toBe('tool_result');
    if (event?.event === 'tool_result') {
      expect(event.data.title).toBe('Weather');
    }
  });

  it('returns null for unknown event types', () => {
    expect(normalizeChatStreamEvent('ping', {})).toBeNull();
  });
});
