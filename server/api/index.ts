import { OpenAPIHono } from '@hono/zod-openapi';
import { healthHandler } from './routes/health';

const app = new OpenAPIHono().basePath('/api');

/**
 * APIのエンドポイント追加
 */
healthHandler(app);

export default defineEventHandler(async (event) => {
  const webReq = toWebRequest(event);
  return await app.fetch(webReq);
});
