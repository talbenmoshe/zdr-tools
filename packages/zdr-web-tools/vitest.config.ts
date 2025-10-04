import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.spec.ts', '__tests__/**/*.spec.tsx'],
    coverage: { provider: 'v8' }
  }
});
