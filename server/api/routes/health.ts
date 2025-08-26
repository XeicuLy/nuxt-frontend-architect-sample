import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { healthResponseSchema } from '../schema/health';

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health Check',
  description: 'APIサーバーが適切に稼働しているかを確認するためのエンドポイント',
  responses: {
    200: {
      content: {
        'application/json': { schema: healthResponseSchema },
      },
      description: 'システムの稼働状況とISO形式のタイムスタンプを含むJSONオブジェクトを返却',
    },
  },
});

export const healthHandler = (app: OpenAPIHono) => {
  app.openapi(healthRoute, (context) => {
    return context.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};
