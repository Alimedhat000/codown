import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      PORT: '5021',
      NODE_ENV: 'test',
    },
    setupFiles: './test/setup.ts',
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
