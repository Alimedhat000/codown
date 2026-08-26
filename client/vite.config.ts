/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import path from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Fresh object per project: vitest mutates browser instance configs while
// registering nested projects, so sharing one literal collides.
const browserConfig = () =>
  ({
    enabled: true,
    headless: true,
    provider: 'playwright',
    instances: [
      {
        browser: 'chromium',
      },
    ],
  }) as const;

// More info: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ⬅️ this is required
    },
  },
  optimizeDeps: {
    // Pre-bundled on first storybook-test run otherwise, which reloads the
    // browser mid-run and fails imports ("Failed to fetch dynamically
    // imported module"). Keep in sync with heavy deps used by stories.
    include: [
      'react-dom/client',
      '@hocuspocus/provider',
      'yjs',
      'y-codemirror.next',
      'codemirror',
      '@codemirror/view',
      '@codemirror/state',
      '@codemirror/language',
      'react-resizable-panels',
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          // One browser instance already stretches CI runners; parallel
          // files alongside the server suite starve vitest's runner.
          fileParallelism: false,
          browser: browserConfig(),
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        // Hook-level tests run in a real browser too — stories can't
        // exercise logic that needs API interactions.
        extends: true,
        test: {
          name: 'browser-unit',
          include: ['src/**/__tests__/*.test.{ts,tsx}'],
          fileParallelism: false,
          browser: browserConfig(),
        },
      },
    ],
  },
});
