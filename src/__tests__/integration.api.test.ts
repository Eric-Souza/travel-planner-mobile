/**
 * Live API smoke tests — requires travel-planner-api on port 8000.
 * Skips automatically when the backend is unreachable.
 */
import { getApiBaseUrl, getApiRootUrl } from '@/src/api/client';

const API_ROOT = getApiRootUrl();
const API_BASE = getApiBaseUrl();

let apiAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${API_ROOT}/health`, { signal: AbortSignal.timeout(5000) });
    apiAvailable = res.ok;
  } catch {
    apiAvailable = false;
  }
});

const itIfApi = (name: string, fn: () => Promise<void>) => {
  it(name, async () => {
    if (!apiAvailable) {
      console.warn('Skipping integration test — backend not running at', API_ROOT);
      return;
    }
    await fn();
  });
};

describe('travel-planner-api integration', () => {
  itIfApi('GET /health returns ok', async () => {
    const res = await fetch(`${API_ROOT}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('ok');
  });

  itIfApi('GET /v1/trips returns seeded demo trip', async () => {
    const res = await fetch(`${API_BASE}/trips`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: Array<{ name: string }> };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    const names = body.data.map((t) => t.name);
    expect(names.some((n) => n.includes('Buenos Aires') || n.includes('Bariloche'))).toBe(true);
  });
});
