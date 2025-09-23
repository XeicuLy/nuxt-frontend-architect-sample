# エラーハンドリング実装詳細（最新版）

## 🚨 統一エラーコード体系

### エラーコード分類

プロジェクトでは体系的なエラーコード分類を実装しています。

```typescript
// shared/constants/errorCode.ts
export const ERROR_TYPES = {
  // ネットワーク関連エラー (NET_xxx)
  CONNECTION_ERROR: 'NET_001', // 接続エラー
  TIMEOUT_ERROR: 'NET_002', // タイムアウトエラー
  NETWORK_DISCONNECTED: 'NET_003', // ネットワーク切断
  DNS_RESOLUTION_ERROR: 'NET_004', // DNS解決エラー

  // サーバー内部エラー (SVR_xxx)
  INTERNAL_SERVER_ERROR: 'SVR_001', // 内部サーバーエラー
  SERVICE_UNAVAILABLE: 'SVR_002', // サービス利用不可
  DATABASE_ERROR: 'SVR_003', // データベースエラー
  EXTERNAL_API_ERROR: 'SVR_004', // 外部API通信エラー
  FILE_OPERATION_ERROR: 'SVR_005', // ファイル操作エラー

  // バリデーションエラー (VAL_xxx)
  VALIDATION_MISSING_PARAMS: 'VAL_001', // 必須パラメータ不足
  VALIDATION_INVALID_FORMAT: 'VAL_002', // 不正な形式
  VALIDATION_OUT_OF_RANGE: 'VAL_003', // 値の範囲外
  VALIDATION_LENGTH_EXCEEDED: 'VAL_004', // 文字数制限超過

  // 認証・認可エラー (AUTH_xxx)
  AUTH_FAILED: 'AUTH_001', // 認証失敗
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_002', // 権限不足
  AUTH_SESSION_EXPIRED: 'AUTH_003', // セッション期限切れ
  AUTH_ACCESS_DENIED: 'AUTH_004', // アクセス拒否

  // 不明・予期しないエラー (UNK_xxx)
  UNEXPECTED_ERROR: 'UNK_001', // 予期しないエラー
  SYSTEM_ERROR: 'UNK_002', // システムエラー
  PROCESSING_INTERRUPTED: 'UNK_003', // 処理中断
  UNKNOWN_STATE: 'UNK_004', // 不明な状態
} as const;
```

## 📋 エラーレスポンス生成

### 統一レスポンス関数

```typescript
/**
 * エラーレスポンスを生成するヘルパー関数
 * @param errorCode - エラーコード
 * @param customMessage - カスタムエラーメッセージ（省略時はデフォルトメッセージを使用）
 * @param timestamp - タイムスタンプ（省略時は現在時刻を使用）
 * @returns エラーレスポンスオブジェクト
 */
export const createErrorResponse = (errorCode: ErrorCode, customMessage?: string, timestamp?: string) => ({
  error: customMessage || ERROR_MESSAGES[errorCode],
  errorCode,
  timestamp: timestamp || new Date().toISOString(),
});
```

### HTTPステータスコードマッピング

```typescript
export const getHttpStatusFromErrorCode = (errorCode: ErrorCode): number => {
  // ネットワークエラー → 408 (Request Timeout) または 503 (Service Unavailable)
  if (errorCode.startsWith('NET_')) {
    return errorCode === ERROR_TYPES.TIMEOUT_ERROR ? 408 : 503;
  }

  // サーバーエラー → 500 (Internal Server Error) または 503 (Service Unavailable)
  if (errorCode.startsWith('SVR_')) {
    return errorCode === ERROR_TYPES.SERVICE_UNAVAILABLE ? 503 : 500;
  }

  // バリデーションエラー → 400 (Bad Request)
  if (errorCode.startsWith('VAL_')) {
    return 400;
  }

  // 認証・認可エラー → 401 (Unauthorized) または 403 (Forbidden)
  if (errorCode.startsWith('AUTH_')) {
    const authUnauthorizedCodes = [ERROR_TYPES.AUTH_FAILED, ERROR_TYPES.AUTH_SESSION_EXPIRED];
    return authUnauthorizedCodes.includes(errorCode) ? 401 : 403;
  }

  // 不明エラー → 500 (Internal Server Error)
  return 500;
};
```

## 🛡️ グローバルエラーハンドリングミドルウェア

### Honoアプリケーション用エラーハンドラー

```typescript
// server/api/middleware/errorHandler.ts

/**
 * Honoアプリケーション用グローバルエラーハンドリングミドルウェア
 * アプリケーション全体で発生したエラーをキャッチし、統一されたエラーレスポンスを返却
 */
export const errorHandlerMiddleware = async (context: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    // エラー処理の実行
    const errorInfo = createErrorInfo(error, context);
    const errorCode = classifyError(error);
    const httpStatus = getHttpStatusFromErrorCode(errorCode);
    const httpStatusConstant = mapStatusCodeToConstant(httpStatus);

    // エラーの詳細をログ出力（構造化されたエラー情報を使用）
    consola.error('Unhandled error in API endpoint:', errorInfo);

    // 統一されたエラーレスポンスを生成
    const errorResponse = createErrorResponse(
      errorCode,
      undefined, // デフォルトのエラーメッセージを使用
      new Date().toISOString(),
    );

    return context.json(errorResponse, httpStatusConstant);
  }
};
```

### エラー分類システム

```typescript
/**
 * エラーオブジェクトから適切なエラーコードを決定する関数
 * @param error - 分類対象のエラー
 * @returns 適切なエラーコード
 */
const classifyError = (error: unknown): ErrorCode => {
  if (!(error instanceof Error)) {
    return ERROR_TYPES.UNEXPECTED_ERROR;
  }

  // エラーメッセージパターンによるエラー分類
  const errorPatterns = [
    {
      patterns: ['timeout', 'TIMEOUT'],
      errorCode: ERROR_TYPES.TIMEOUT_ERROR,
    },
    {
      patterns: ['network', 'NETWORK'],
      errorCode: ERROR_TYPES.CONNECTION_ERROR,
    },
    {
      patterns: ['database', 'DB'],
      errorCode: ERROR_TYPES.DATABASE_ERROR,
    },
    {
      patterns: ['validation', 'invalid'],
      errorCode: ERROR_TYPES.VALIDATION_INVALID_FORMAT,
    },
    {
      patterns: ['file', 'FILE'],
      errorCode: ERROR_TYPES.FILE_OPERATION_ERROR,
    },
  ] as const;

  // ZodErrorの特別な処理
  if (error.name === 'ZodError') {
    return ERROR_TYPES.VALIDATION_INVALID_FORMAT;
  }

  // メッセージパターンによる分類
  const matchedPattern = errorPatterns.find(({ patterns }) =>
    patterns.some((pattern) => error.message.includes(pattern)),
  );

  return matchedPattern?.errorCode ?? ERROR_TYPES.INTERNAL_SERVER_ERROR;
};
```

## 🏥 ヘルスチェックAPIのエラーハンドリング

### Zodスキーマ定義（JSDoc修正済み）

```typescript
// server/api/schema/health.ts

/**
 * ヘルスチェックAPIのクエリパラメーターバリデーションスキーマ
 * エラーケースをテストするためのシミュレーション機能を提供
 */
export const healthQuerySchema = z.object({
  simulate: z.enum(['error', 'timeout']).optional().openapi({
    description: 'エラーをシミュレートするためのテストパラメーター。error=SVR_002, timeout=NET_002',
    example: 'error',
  }),
});

/**
 * ヘルスチェック成功時のレスポンススキーマ
 * システムの稼働状況とタイムスタンプを含む
 */
export const healthResponseSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.iso.datetime().openapi({ example: new Date().toISOString() }),
});

/**
 * ヘルスチェックエラー時のレスポンススキーマ
 * 統一されたエラーコード体系に準拠したエラー情報を提供
 */
export const healthErrorSchema = z.object({
  error: z.string().openapi({ example: 'Service temporarily unavailable' }),
  errorCode: z.enum(Object.values(ERROR_TYPES)).openapi({
    example: 'SVR_002',
    description:
      '統一エラーコード: NET_xxx(ネットワーク), SVR_xxx(サーバー), VAL_xxx(バリデーション), AUTH_xxx(認証), UNK_xxx(不明)',
  }),
  timestamp: z.iso.datetime().openapi({ example: new Date().toISOString() }),
});
```

### エラーシミュレーション機能

```typescript
// server/api/routes/health.ts（JSDoc修正済み）

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

    // 実際のヘルスチェック実行とエラーハンドリング
    try {
      await performHealthChecks();
      return context.json({ status: 'ok', timestamp: new Date().toISOString() }, HTTP_STATUS.OK);
    } catch (error) {
      // 実際のエラーケースに応じた適切なエラーコード返却
      let errorCode: ErrorCode = ERROR_TYPES.UNEXPECTED_ERROR;
      let customMessage = 'Health check failed';

      if (error instanceof Error) {
        if (error.message.includes('FILE_SYSTEM_ERROR')) {
          errorCode = ERROR_TYPES.FILE_OPERATION_ERROR;
          customMessage = 'File system health check failed';
        } else if (error.message.includes('EXTERNAL_SERVICE_ERROR') || error.message.includes('EXTERNAL_API_ERROR')) {
          errorCode = ERROR_TYPES.EXTERNAL_API_ERROR;
          customMessage = 'External service health check failed';
        } else if (error.message.includes('memory')) {
          errorCode = ERROR_TYPES.INTERNAL_SERVER_ERROR;
          customMessage = 'System resource health check failed';
        } else {
          errorCode = ERROR_TYPES.UNEXPECTED_ERROR;
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
```

### ヘルスチェック関数（JSDoc修正済み）

```typescript
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
```

## 🚪 404エラーハンドリング

```typescript
/**
 * 404エラー（Not Found）用のハンドラー
 * @param context - Honoコンテキスト
 * @returns 404エラーレスポンス
 */
export const notFoundHandler = (context: Context) => {
  const errorResponse = createErrorResponse(
    ERROR_TYPES.UNKNOWN_STATE, // 不明な状態（存在しないエンドポイント）
    `Endpoint not found: ${context.req.method} ${context.req.path}`,
    new Date().toISOString(),
  );

  return context.json(errorResponse, HTTP_STATUS.NOT_FOUND);
};
```

## 🔄 OpenAPI統合

### API仕様での定義

ヘルスチェックAPIは以下のエラーレスポンスを定義：

- **408 Request Timeout**: `NET_002` タイムアウトエラー
- **500 Internal Server Error**: `SVR_001` 内部サーバーエラー
- **503 Service Unavailable**: `SVR_002` サービス利用不可エラー

### Swagger UIでの確認

- **URL**: http://localhost:3000/api/swagger
- **テスト**: `?simulate=error` または `?simulate=timeout` パラメーターでエラーケースをテスト可能

## 🧪 エラーハンドリングのテスト

### エラーシミュレーション

```bash
# 開発サーバー起動後
curl "http://localhost:3000/api/health?simulate=error"
curl "http://localhost:3000/api/health?simulate=timeout"
```

### 期待されるレスポンス例

```json
{
  "error": "Service temporarily unavailable for maintenance",
  "errorCode": "SVR_002",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 フロントエンドでの活用

TanStack Queryとの統合により、フロントエンドでも統一されたエラーハンドリングが可能：

```typescript
const { data, error, isError } = useHealthQuery();

if (isError && error) {
  // error.errorCode で統一エラーコードにアクセス
  // error.error でエラーメッセージにアクセス
  // error.timestamp でエラー発生時刻にアクセス
}
```

この実装により、プロジェクト全体で一貫したエラーハンドリングが提供され、デバッグ・保守性・ユーザー体験の向上が実現されています。
