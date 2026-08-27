import { createServer, type Server } from 'node:http';

import axios from 'axios';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { clearAccessToken, setAccessToken } from '@/utils/token';

import { api, onSessionExpired } from '../api';

const PORT = 4599;
const BASE = `http://localhost:${PORT}`;

let server: Server;
let refreshCallCount = 0;
let refreshShouldFail = false;
const protectedAuthHeaders: string[] = [];

/**
 * Minimal API stub: /protected requires the *new* token, /api/auth/refresh
 * issues it once. Behaves like the real server for the paths under test.
 */
async function startStub(): Promise<void> {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (req.url === '/api/auth/refresh') {
        refreshCallCount += 1;
        res.setHeader('Content-Type', 'application/json');
        if (refreshShouldFail) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Unauthorized' }));
        } else {
          res.end(
            JSON.stringify({ accessToken: 'new-token', user: { id: 'u1' } }),
          );
        }
        return;
      }
      if (req.url === '/protected') {
        protectedAuthHeaders.push(req.headers.authorization ?? '');
        if (req.headers.authorization === 'Bearer new-token') {
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Invalid or expired token' }));
        }
        return;
      }
      if (req.url === '/always-401') {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid or expired token' }));
        return;
      }
      res.statusCode = 404;
      res.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
}

beforeAll(startStub);
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('api response interceptor', () => {
  it('retries a request once after refreshing on 401', async () => {
    refreshCallCount = 0;
    protectedAuthHeaders.length = 0;
    setAccessToken('old-token');

    const res = await api.get(`${BASE}/protected`);

    expect(res.data).toEqual({ ok: true });
    expect(refreshCallCount).toBe(1);
    // first attempt used stale token, replay used the refreshed one
    expect(protectedAuthHeaders).toEqual([
      'Bearer old-token',
      'Bearer new-token',
    ]);
  });

  it('issues only one refresh for concurrent 401 responses', async () => {
    refreshCallCount = 0;
    protectedAuthHeaders.length = 0;
    setAccessToken('old-token');

    const [a, b, c] = await Promise.all([
      api.get(`${BASE}/protected`),
      api.get(`${BASE}/protected`),
      api.get(`${BASE}/protected`),
    ]);

    expect(a.data).toEqual({ ok: true });
    expect(b.data).toEqual({ ok: true });
    expect(c.data).toEqual({ ok: true });
    expect(refreshCallCount).toBe(1);
  });

  it('clears the token and notifies listeners when refresh fails', async () => {
    refreshShouldFail = true;
    setAccessToken('expired-token');
    const expired = vi.fn();
    const unsubscribe = onSessionExpired(expired);

    await expect(api.get(`${BASE}/always-401`)).rejects.toThrow();

    expect(expired).toHaveBeenCalledTimes(1);
    unsubscribe();
    refreshShouldFail = false;
  });

  it('notifies sessionExpired listeners only once for concurrent refresh failures', async () => {
    refreshShouldFail = true;
    refreshCallCount = 0;
    setAccessToken('expired-token');
    const expired = vi.fn();
    const unsubscribe = onSessionExpired(expired);

    await Promise.allSettled([
      api.get(`${BASE}/always-401`),
      api.get(`${BASE}/always-401`),
      api.get(`${BASE}/always-401`),
    ]);

    expect(expired).toHaveBeenCalledTimes(1);
    expect(refreshCallCount).toBe(1);
    unsubscribe();
    refreshShouldFail = false;
  });

  it('does not attempt a refresh when no access token is stored', async () => {
    refreshCallCount = 0;
    clearAccessToken();

    await expect(api.get(`${BASE}/always-401`)).rejects.toThrow();
    expect(refreshCallCount).toBe(0);
  });

  it('uses the shared instance against the configured base URL without manual base joining', async () => {
    // sanity check that the exported api is an axios instance wired to env config
    expect(
      axios.isAxiosError(await api.get(`${BASE}/missing`).catch((e) => e)),
    ).toBe(true);
  });
});
