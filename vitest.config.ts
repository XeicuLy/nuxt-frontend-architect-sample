import { defineVitestProject } from '@nuxt/test-utils/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['verbose'],
    coverage: {
      reportsDirectory: '../logs/coverage',
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['**/*.{test,spec}.ts'],
          exclude: ['**/*.nuxt.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['**/*.nuxt.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
});
