import { act } from 'react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useCollaborators } from '../use-collaborators';

const mockApi = vi.mocked(api, true);

/**
 * Renders a hook inside a probe component mounted on document.body and
 * exposes its latest return value, since no DOM-testing library is wired
 * into the client suite.
 *
 * @param useHook - Hook factory invoked on every render of the probe.
 * @returns The latest hook result plus unmount for cleanup.
 */
function renderHook<T>(useHook: () => T) {
  let result!: T;
  let root!: Root;

  const Probe = () => {
    result = useHook();
    return null;
  };

  const host = document.createElement('div');
  document.body.appendChild(host);

  act(() => {
    root = createRoot(host);
    root.render(createElement(Probe) as ReactNode);
  });

  return {
    get current() {
      return result;
    },
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

/**
 * Flushes pending React updates and microtasks. Polls until the
 * predicate holds, so `await act(async () => {})` empty flushes don't
 * flake when the initial fetch resolves on the next microtask.
 *
 * @param predicate - Condition to wait for.
 * @param timeoutMs - Fail after this long.
 */
async function waitFor(predicate: () => boolean, timeoutMs = 1000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor timeout');
    }
    await act(async () => {
      await new Promise<void>((r) => {
        setTimeout(r, 0);
      });
    });
  }
}

describe('useCollaborators', () => {
  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    mockApi.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('clears a stale add error when a retry succeeds', async () => {
    const hook = renderHook(() => useCollaborators('doc1'));
    await waitFor(() => !hook.current.loading);

    mockApi.post.mockRejectedValueOnce(new Error('boom'));
    await act(async () => {
      await hook.current.addCollaborator('a@b.c');
    });
    expect(hook.current.error).toBe('Failed to add collaborator');

    mockApi.post.mockResolvedValueOnce({});
    let added = false;
    await act(async () => {
      added = await hook.current.addCollaborator('a@b.c');
    });

    expect(added).toBe(true);
    expect(hook.current.error).toBeNull();
    hook.unmount();
  });

  it('clears a stale remove error when a retry succeeds', async () => {
    const hook = renderHook(() => useCollaborators('doc1'));
    await waitFor(() => !hook.current.loading);

    mockApi.delete.mockRejectedValueOnce(new Error('boom'));
    await act(async () => {
      await hook.current.removeCollaborator('u1');
    });
    expect(hook.current.error).toBe('Failed to remove collaborator');

    mockApi.delete.mockResolvedValueOnce({});
    await act(async () => {
      await hook.current.removeCollaborator('u1');
    });

    expect(hook.current.error).toBeNull();
    hook.unmount();
  });

  it('surfaces an error when adding fails', async () => {
    const hook = renderHook(() => useCollaborators('doc1'));
    await waitFor(() => !hook.current.loading);

    mockApi.post.mockRejectedValueOnce(new Error('boom'));
    let added = true;
    await act(async () => {
      added = await hook.current.addCollaborator('a@b.c');
    });

    expect(added).toBe(false);
    expect(hook.current.error).toBe('Failed to add collaborator');
    hook.unmount();
  });

  it('surfaces an error when removing fails', async () => {
    const hook = renderHook(() => useCollaborators('doc1'));
    await waitFor(() => !hook.current.loading);

    mockApi.delete.mockRejectedValueOnce(new Error('boom'));
    await act(async () => {
      await hook.current.removeCollaborator('u1');
    });

    expect(hook.current.error).toBe('Failed to remove collaborator');
    hook.unmount();
  });
});
