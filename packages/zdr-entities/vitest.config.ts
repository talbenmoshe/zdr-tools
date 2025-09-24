import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.spec.ts', '__tests__/**/*.spec.tsx'],
    setupFiles: ['__tests__/setup.ts'],
    typecheck: { tsconfig: '__tests__/tsconfig.json' },
    coverage: { provider: 'v8' }
  }
});
