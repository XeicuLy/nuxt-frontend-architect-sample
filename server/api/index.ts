import { Hono } from 'hono';

const app = new Hono().basePath('/api').get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export type HonoApp = typeof app;

export default defineEventHandler(async (event) => {
  const webReq = toWebRequest(event);
  return await app.fetch(webReq);
});
