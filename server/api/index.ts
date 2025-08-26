import { Hono } from 'hono';

const app = new Hono().basePath('/api').get('/health', (c) => {
  return c.text(`This is Nuxt Frontend Architect Sample API Server!`);
});

export type HonoApp = typeof app;

export default defineEventHandler(async (event) => {
  const webReq = toWebRequest(event);
  return await app.fetch(webReq);
});
