import { formatTimeLabel, parseDateOnly, toDateOnlyString } from '@/src/utils/datetime';

describe('datetime utils', () => {
  it('round-trips date-only strings', () => {
    const d = parseDateOnly('2026-08-01');
    expect(d).toBeDefined();
    expect(toDateOnlyString(d!)).toBe('2026-08-01');
  });

  it('formats time labels', () => {
    expect(formatTimeLabel(14, 30)).toBe('2:30 PM');
    expect(formatTimeLabel(0, 5)).toBe('12:05 AM');
  });
});
