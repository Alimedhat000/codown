import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

const TEST_SHARE_SECRET = 'test-share-link-secret-lane-c';

const BASE_ENV: Record<string, string> = {
  PORT: '5021',
  NODE_ENV: 'test',
  POSTGRES_USER: 'test',
  POSTGRES_PASSWORD: 'test',
  POSTGRES_DB: 'test',
  POSTGRES_PORT: '5432',
  DATABASE_URL: 'postgres://test:test@localhost:5432/test',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
};

function setEnv(overrides: Record<string, string | undefined> = {}) {
  const next = { ...BASE_ENV, ...overrides };
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

async function importEnvConfig() {
  return import('@/config/env.config');
}

async function importShareToken() {
  return import('@/lib/shareToken');
}

describe('SHARE_LINK_SECRET enforcement (#28)', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    vi.resetModules();
    originalEnv = { ...process.env };
    setEnv({ SHARE_LINK_SECRET: TEST_SHARE_SECRET });
  });

  afterEach(() => {
    for (const key of Object.keys(BASE_ENV)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  describe('env config validation', () => {
    it('rejects startup when SHARE_LINK_SECRET is missing', async () => {
      setEnv({ SHARE_LINK_SECRET: undefined });

      let thrown: unknown;
      try {
        await importEnvConfig();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeDefined();
      expect(String(thrown)).toContain('SHARE_LINK_SECRET');
    });

    it('exposes the validated SHARE_LINK_SECRET on the parsed env', async () => {
      const { env } = await importEnvConfig();

      expect(env.SHARE_LINK_SECRET).toBe(TEST_SHARE_SECRET);
    });
  });

  describe('share token signing', () => {
    it('round-trips a generated share token', async () => {
      const { generateShareToken, verifyShareToken } = await importShareToken();

      const token = generateShareToken('share-id-1', 'edit');

      expect(verifyShareToken(token)).toMatchObject({
        shareId: 'share-id-1',
        permission: 'edit',
      });
    });

    it('rejects tokens forged with the removed super-secret fallback', async () => {
      const { verifyShareToken } = await importShareToken();

      const forged = jwt.sign({ shareId: 'share-id-1', permission: 'view' }, 'super-secret', {
        expiresIn: '7d',
      });

      expect(() => verifyShareToken(forged)).toThrow();
    });

    it('refuses to operate without SHARE_LINK_SECRET instead of falling back', async () => {
      setEnv({ SHARE_LINK_SECRET: undefined });

      await expect(importShareToken()).rejects.toThrow(/SHARE_LINK_SECRET/);
    });
  });
});
