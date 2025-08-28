import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { healthHandler } from './routes/health';

const app = new OpenAPIHono().basePath('/api');

/**
 * APIのエンドポイント追加
 */
healthHandler(app);

app.doc('/openapi.yaml', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Nuxt Frontend Architect Sample API',
  },
});

app.get('/swagger', swaggerUI({ url: '/api/openapi.yaml' }));

export default defineEventHandler(async (event) => {
  const webReq = toWebRequest(event);
  return await app.fetch(webReq);
});
