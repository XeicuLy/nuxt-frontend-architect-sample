import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:3000/api/openapi.yaml',
  output: './shared/types/api',
  plugins: ['@hey-api/typescript'],
});
