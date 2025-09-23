import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { createErrorResponse, ERROR_TYPES } from '#shared/constants/errorCode';
import { HTTP_STATUS } from '#shared/constants/httpStatus';
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
    [HTTP_STATUS.OK]: {
      content: {
        'application/json': { schema: healthResponseSchema },
      },
      description: 'システムの稼働状況とISO形式のタイムスタンプを含むJSONオブジェクトを返却',
    },
    [HTTP_STATUS.REQUEST_TIMEOUT]: {
      content: {
        'application/json': { schema: healthErrorSchema },
      },
      description: 'タイムアウトエラー（テスト用：?simulate=timeoutで発生）',
    },
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: {
      content: {
        'application/json': { schema: healthErrorSchema },
      },
      description: 'サーバーエラー（テスト用：?simulate=errorで発生）',
    },
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: {
      content: {
        'application/json': { schema: healthErrorSchema },
      },
      description: 'サービス利用不可エラー（実際のヘルスチェック失敗時）',
    },
  },
});

/**
 * ヘルスチェック結果を表現する型
 * 成功時はデータを、失敗時はエラーメッセージを含む
 */
type HealthCheckResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * メモリ使用量をチェックする関数
 * @returns メモリ使用量（MB）またはエラー情報
 */
const checkMemoryUsage = (): HealthCheckResult<number> => {
  const memUsage = process.memoryUsage();
  const memUsageMB = memUsage.heapUsed / 1024 / 1024;

  return memUsageMB > 1024
    ? { success: false, error: 'High memory usage detected' }
    : { success: true, data: memUsageMB };
};

/**
 * ファイルシステムアクセスをチェックする関数
 * @returns テストデータまたはエラー情報
 */
const checkFileSystemAccess = (): HealthCheckResult<string> => {
  try {
    const testData = JSON.stringify({ test: true, timestamp: Date.now() });
    return testData ? { success: true, data: testData } : { success: false, error: 'FILE_SYSTEM_ERROR' };
  } catch {
    return { success: false, error: 'FILE_SYSTEM_ERROR' };
  }
};

/**
 * 外部サービス接続をチェックする非同期関数
 * @returns 接続状況またはエラー情報
 */
const checkExternalService = async (): Promise<HealthCheckResult<boolean>> => {
  try {
    const isHealthy = await mockExternalServiceCheck();
    return isHealthy ? { success: true, data: isHealthy } : { success: false, error: 'EXTERNAL_SERVICE_ERROR' };
  } catch {
    return { success: false, error: 'EXTERNAL_API_ERROR' };
  }
};

/**
 * ヘルスチェック処理を実行する関数
 * メモリ、ファイルシステム、外部サービスの状態をチェック
 * @throws {Error} チェックが失敗した場合
 */
const performHealthChecks = async () => {
  // 関数型的なチェック実行
  const memoryResult = checkMemoryUsage();
  if (!memoryResult.success) {
    throw new Error(memoryResult.error);
  }

  const fileSystemResult = checkFileSystemAccess();
  if (!fileSystemResult.success) {
    throw new Error(fileSystemResult.error);
  }

  const externalServiceResult = await checkExternalService();
  if (!externalServiceResult.success) {
    throw new Error(externalServiceResult.error);
  }

  // 既存の仕様に合わせて成功オブジェクトを返す
  return { success: true };
};

/**
 * 外部サービスのヘルスチェック（模擬実装）
 * @returns サービスの稼働状況
 */
const mockExternalServiceCheck = async (): Promise<boolean> => {
  // 実際の環境では、データベースや外部APIの接続テストを行う
  return new Promise((resolve) => {
    setTimeout(() => {
      // ランダムに失敗することがある（テスト用）
      const isHealthy = Math.random() > 0.1; // 90%の確率で成功
      resolve(isHealthy);
    }, 100);
  });
};

export const healthHandler = (app: OpenAPIHono) => {
  app.openapi(healthRoute, async (context) => {
    const { simulate } = context.req.valid('query');

    // エラーシミュレーション（可読性の高いエラータイプを使用）
    if (simulate === 'error') {
      const errorResponse = createErrorResponse(
        ERROR_TYPES.SERVICE_UNAVAILABLE, // サービス利用不可
        'Service temporarily unavailable for maintenance',
      );
      return context.json(errorResponse, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (simulate === 'timeout') {
      const errorResponse = createErrorResponse(
        ERROR_TYPES.TIMEOUT_ERROR, // タイムアウトエラー
        'Health check request timeout occurred',
      );
      return context.json(errorResponse, HTTP_STATUS.REQUEST_TIMEOUT);
    }

    // 実際のヘルスチェック実行
    try {
      await performHealthChecks();

      // 通常のヘルスチェック成功レスポンス
      return context.json({ status: 'ok', timestamp: new Date().toISOString() }, HTTP_STATUS.OK);
    } catch (error) {
      // 実際のエラーケースに応じた適切なエラーコード返却
      let errorCode: (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES] = ERROR_TYPES.UNEXPECTED_ERROR; // デフォルト
      let customMessage = 'Health check failed';

      if (error instanceof Error) {
        if (error.message.includes('FILE_SYSTEM_ERROR')) {
          errorCode = ERROR_TYPES.FILE_OPERATION_ERROR; // ファイル操作エラー
          customMessage = 'File system health check failed';
        } else if (error.message.includes('EXTERNAL_SERVICE_ERROR') || error.message.includes('EXTERNAL_API_ERROR')) {
          errorCode = ERROR_TYPES.EXTERNAL_API_ERROR; // 外部API通信エラー
          customMessage = 'External service health check failed';
        } else if (error.message.includes('memory')) {
          errorCode = ERROR_TYPES.INTERNAL_SERVER_ERROR; // 内部サーバーエラー
          customMessage = 'System resource health check failed';
        } else {
          errorCode = ERROR_TYPES.UNEXPECTED_ERROR; // 予期しないエラー
          customMessage = 'Unexpected error during health check';
        }
      }

      const errorResponse = createErrorResponse(errorCode, customMessage);
      const httpStatus = errorCode.startsWith('SVR_')
        ? HTTP_STATUS.INTERNAL_SERVER_ERROR
        : HTTP_STATUS.SERVICE_UNAVAILABLE;

      return context.json(errorResponse, httpStatus);
    }
  });
};
