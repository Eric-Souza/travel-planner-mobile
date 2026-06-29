import { ApiError } from '@/src/api/client';
import { getNetworkErrorMessage, parseApiError } from '@/src/utils/errors';

describe('parseApiError', () => {
  it('returns ApiError message', () => {
    const err = new ApiError(400, {
      error: { code: 'VALIDATION_ERROR', message: 'Invalid dates' },
    });
    expect(parseApiError(err)).toBe('Invalid dates');
  });

  it('returns generic message for unknown values', () => {
    expect(parseApiError({})).toBe('Something went wrong. Please try again.');
  });
});

describe('getNetworkErrorMessage', () => {
  it('detects fetch failures', () => {
    const err = new TypeError('fetch failed');
    expect(getNetworkErrorMessage(err)).toContain('Cannot reach the API');
  });

  it('falls back to parseApiError for API errors', () => {
    const err = new ApiError(500, {
      error: { code: 'INTERNAL', message: 'Server error' },
    });
    expect(getNetworkErrorMessage(err)).toBe('Server error');
  });
});
