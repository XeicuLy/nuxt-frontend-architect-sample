import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      reportsDirectory: '../logs/coverage',
    },
  },
});
