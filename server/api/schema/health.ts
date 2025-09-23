import { z } from '@hono/zod-openapi';

// クエリパラメーターのスキーマ（テスト用）
export const healthQuerySchema = z.object({
  simulate: z.enum(['error', 'timeout']).optional().openapi({
    description: 'エラーをシミュレートするためのテストパラメーター。error=SVR_002, timeout=NET_002',
    example: 'error',
  }),
});

// 成功時のレスポンススキーマ
export const healthResponseSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.iso.datetime().openapi({ example: new Date().toISOString() }),
});

// エラー時のレスポンススキーマ（実践的エラーコード対応）
export const healthErrorSchema = z.object({
  error: z.string().openapi({ example: 'Service temporarily unavailable' }),
  errorCode: z.string().openapi({
    example: 'SVR_002',
    description: 'カスタムエラーコード（NET_xxx: ネットワーク, SVR_xxx: サーバー, UNK_xxx: 不明）',
  }),
  timestamp: z.iso.datetime().openapi({ example: new Date().toISOString() }),
});
