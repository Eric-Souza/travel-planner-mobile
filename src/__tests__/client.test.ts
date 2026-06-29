import { ApiError, getApiBaseUrl, getApiRootUrl } from '@/src/api/client';

const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

afterEach(() => {
  if (originalEnv === undefined) {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  } else {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
  }
});

describe('getApiBaseUrl', () => {
  it('uses EXPO_PUBLIC_API_BASE_URL without trailing slash', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://192.168.1.5:8000/v1/';
    expect(getApiBaseUrl()).toBe('http://192.168.1.5:8000/v1');
  });

  it('falls back to localhost default', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(getApiBaseUrl()).toBe('http://localhost:8000/v1');
  });
});

describe('getApiRootUrl', () => {
  it('strips /v1 suffix for health checks', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000/v1';
    expect(getApiRootUrl()).toBe('http://localhost:8000');
  });
});

describe('ApiError', () => {
  it('exposes code, status, and request id from envelope', () => {
    const err = new ApiError(404, {
      error: { code: 'NOT_FOUND', message: 'Trip not found' },
      request_id: 'req_abc',
    });
    expect(err.message).toBe('Trip not found');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.status).toBe(404);
    expect(err.requestId).toBe('req_abc');
  });
});
