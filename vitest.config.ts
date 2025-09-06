import path from 'node:path';
import { defineVitestProject } from '@nuxt/test-utils/config';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../logs/coverage',
      exclude: ['**/types/*'],
      include: ['app/**/*', 'server/**/*', 'shared/**/*'],
    },
    projects: [
      {
        plugins: [vue()],
        test: {
          name: 'unit',
          include: ['**/*.{test,spec}.ts'],
          exclude: ['node_modules/', '**/*.nuxt.{test,spec}.ts'],
          environment: 'happy-dom',
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './app/'),
            '~': path.resolve(__dirname, './app/'),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['**/*.nuxt.{test,spec}.ts'],
          exclude: ['node_modules/'],
          environment: 'nuxt',
        },
      }),
    ],
  },
});
