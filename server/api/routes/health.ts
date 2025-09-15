import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { healthErrorSchema, healthQuerySchema, healthResponseSchema } from '../schema/health';

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health Check',
  description:
    'APIサーバーが適切に稼働しているかを確認するためのエンドポイント。?simulate=errorでエラーケースをテスト可能',
  request: {
    query: healthQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: healthResponseSchema },
      },
      description: 'システムの稼働状況とISO形式のタイムスタンプを含むJSONオブジェクトを返却',
    },
    408: {
      content: {
        'application/json': { schema: healthErrorSchema },
      },
      description: 'タイムアウトエラー（テスト用：?simulate=timeoutで発生）',
    },
    500: {
      content: {
        'application/json': { schema: healthErrorSchema },
      },
      description: 'サーバーエラー（テスト用：?simulate=errorで発生）',
    },
  },
});

export const healthHandler = (app: OpenAPIHono) => {
  app.openapi(healthRoute, (context) => {
    const { simulate } = context.req.valid('query');

    // エラーシミュレーション（実践的エラーコード対応）
    if (simulate === 'error') {
      return context.json(
        {
          error: 'Service temporarily unavailable',
          errorCode: 'SVR_002', // SERVICE_UNAVAILABLE
          timestamp: new Date().toISOString(),
        },
        500,
      );
    }

    if (simulate === 'timeout') {
      return context.json(
        {
          error: 'Request timeout occurred',
          errorCode: 'NET_002', // TIMEOUT_ERROR
          timestamp: new Date().toISOString(),
        },
        408, // Request Timeout
      );
    }

    // 通常のヘルスチェック成功レスポンス
    return context.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
  });
};
