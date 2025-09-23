# 🔗 API統合をはじめよう

初学者向けに、このプロジェクトの **API-First** 開発について、日常的な例え話で分かりやすく説明します。

## 📮 郵便システムに例えるAPI-First開発

### API-Firstって何？

**API-First開発**を郵便システムに例えてみましょう：

#### 🤔 従来のやり方（問題あり）

```
1. 👨‍💻 Aさん: 手紙を書く
2. 👩‍💻 Bさん: 返事を書く
3. 😰 問題発生: 「どうやって送ろう？住所の書き方は？」
4. 🔄 やり直し: 手紙を書き直し
```

#### ✅ API-Firstのやり方（スマート）

```
1. 📋 最初に郵便ルールを決める
   - 住所の書き方
   - 封筒のサイズ
   - 切手の種類
2. 👨‍💻 Aさん: ルールに従って手紙を書く
3. 👩‍💻 Bさん: 同じルールで返事を書く
4. 🎉 完璧に届く！
```

### プログラムで言うと...

**郵便ルール** = **API仕様（OpenAPI）**

- どんなデータを送るか
- どんな形式で送るか
- どんな返事が来るか

**手紙** = **フロントエンド・バックエンドのコード**

- API仕様に従って作る
- お互いが理解できる形式

### なぜAPI-Firstが良いの？

#### 🎯 間違いが減る

- 最初にルールを決めるので、勘違いがない
- 自動でチェックしてくれる

#### ⚡ 作業が早くなる

- 手動で型を作る必要がない
- フロントとバックを同時に開発できる

#### 📚 ドキュメントが自動で作られる

- APIの使い方が自動で説明される
- 新しい人もすぐに理解できる

## このプロジェクトのAPI実装

### Health API の定義

このプロジェクトには **Health API** が実装されています：

```typescript
// server/api/schema/health.ts（実際のファイル）
import { z } from '@hono/zod-openapi';
import { ERROR_TYPES } from '#shared/constants/errorCode';

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

### 統一エラーコード体系

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

### API実装（エラーハンドリング対応）

```typescript
// server/api/routes/health.ts（実際のファイル）
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { createErrorResponse, ERROR_TYPES } from '#shared/constants/errorCode';
import { HTTP_STATUS } from '#shared/constants/httpStatus';
import { healthErrorSchema, healthQuerySchema, healthResponseSchema } from '../schema/health';

export const healthHandler = (app: OpenAPIHono) => {
  app.openapi(healthRoute, async (context) => {
    const { simulate } = context.req.valid('query');

    // エラーシミュレーション（テスト用）
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
      return context.json({ status: 'ok', timestamp: new Date().toISOString() }, HTTP_STATUS.OK);
    } catch (error) {
      // エラーケースに応じた適切なエラーコード返却
      const errorCode = classifyHealthCheckError(error);
      const errorResponse = createErrorResponse(errorCode, 'Health check failed');
      const httpStatus = errorCode.startsWith('SVR_')
        ? HTTP_STATUS.INTERNAL_SERVER_ERROR
        : HTTP_STATUS.SERVICE_UNAVAILABLE;

      return context.json(errorResponse, httpStatus);
    }
  });
};
```

## 型定義の自動生成

### 設定ファイル

```typescript
// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './public/openapi.yaml',
  output: './shared/types/api',
  plugins: ['@hey-api/typescript', { name: 'zod', exportFromIndex: true }],
});
```

### 生成されるファイル

```
shared/types/api/
├── index.ts       # エクスポート用インデックス
├── types.gen.ts   # TypeScript型定義
└── zod.gen.ts     # Zodスキーマ
```

### 型定義生成コマンド

**📝 重要**: 型定義生成は2ステップで実行されます

```bash
# 1. 開発サーバーを起動
pnpm dev

# 2. 別ターミナルで型定義生成
pnpm generate-types
```

**🔄 内部動作**:

1. **OpenAPIスペック収集**: サーバーから `/api/openapi.yaml` を取得して `public/openapi.yaml` に保存
2. **型定義生成**: ローカルファイルから `shared/types/api/` に型を生成
3. **コード整形**: 生成されたコードを自動整形

## 型安全なAPI通信の実装

### サービス層での使用

```typescript
// app/services/health.ts
import { type GetApiHealthResponse, zGetApiHealthResponse } from '#shared/types/api';

export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  // 1. HTTP通信
  const response = await $fetch<GetApiHealthResponse>('/api/health', {
    method: 'GET',
  });

  // 2. ランタイム検証（Zodスキーマ）
  return zGetApiHealthResponse.parse(response);
};
```

### TanStack Query との統合

```typescript
// app/queries/useHealthQuery.ts
import { useQuery } from '@tanstack/vue-query';
import { getHealthApi } from '~/services/health';

export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });

  return { healthQuery };
};
```

### コンポーネントでの使用

```typescript
// app/composables/useHealth/useHealthAdapter.ts
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data, suspense: getHealthData } = healthQuery;

  const healthStatusData = computed(() => ({
    healthStatus: data.value?.status ?? '-',
    healthTimestamp: data.value?.timestamp ?? '-',
  }));

  return { isLoading, healthStatusData, getHealthData };
};
```

## API ドキュメントの確認

### Swagger UI へのアクセス

開発サーバー起動後、以下のURLでAPIドキュメントを確認できます：

- **Swagger UI**: http://localhost:3000/api/swagger
- **OpenAPI仕様**: http://localhost:3000/api/openapi.yaml

### API テストの実行

Swagger UI画面で実際にAPIを試すことができます：

1. http://localhost:3000/api/swagger にアクセス
2. Health Check APIを選択
3. 「Try it out」ボタンをクリック
4. エラーシミュレーションのテスト:
   - `simulate` パラメーターに `error` を入力 → `SVR_002` エラー
   - `simulate` パラメーターに `timeout` を入力 → `NET_002` エラー
   - パラメーターなしで実行 → 正常レスポンス
5. 「Execute」ボタンでAPIを実行

### コマンドラインでのテスト

```bash
# 正常ケース
curl "http://localhost:3000/api/health"

# エラーシミュレーション
curl "http://localhost:3000/api/health?simulate=error"
curl "http://localhost:3000/api/health?simulate=timeout"
```

### 期待されるレスポンス例

**正常時**:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**エラー時**:

```json
{
  "error": "Service temporarily unavailable for maintenance",
  "errorCode": "SVR_002",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## グローバルエラーハンドリング

### エラーハンドリングミドルウェア

プロジェクト全体で統一されたエラー処理を提供するミドルウェア：

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

    // エラーの詳細をログ出力
    consola.error('Unhandled error in API endpoint:', errorInfo);

    // 統一されたエラーレスポンスを生成
    const errorResponse = createErrorResponse(errorCode);
    return context.json(errorResponse, httpStatus);
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
    { patterns: ['timeout', 'TIMEOUT'], errorCode: ERROR_TYPES.TIMEOUT_ERROR },
    { patterns: ['network', 'NETWORK'], errorCode: ERROR_TYPES.CONNECTION_ERROR },
    { patterns: ['database', 'DB'], errorCode: ERROR_TYPES.DATABASE_ERROR },
    { patterns: ['validation', 'invalid'], errorCode: ERROR_TYPES.VALIDATION_INVALID_FORMAT },
    { patterns: ['file', 'FILE'], errorCode: ERROR_TYPES.FILE_OPERATION_ERROR },
  ];

  // ZodErrorの特別な処理
  if (error instanceof ZodError) {
    return ERROR_TYPES.VALIDATION_INVALID_FORMAT;
  }

  // メッセージパターンによる分類
  const matchedPattern = errorPatterns.find(({ patterns }) =>
    patterns.some((pattern) => error.message.includes(pattern)),
  );

  return matchedPattern?.errorCode ?? ERROR_TYPES.INTERNAL_SERVER_ERROR;
};
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

## JSDocベストプラクティス

### 適切なJSDoc記述例

```typescript
/**
 * ヘルスチェック処理を実行する関数
 * メモリ、ファイルシステム、外部サービスの状態をチェック
 * @throws {Error} チェックが失敗した場合
 */
const performHealthChecks = async () => {
  // 実装...
};

/**
 * メモリ使用量をチェックする関数
 * @returns メモリ使用量（MB）またはエラー情報
 */
const checkMemoryUsage = (): HealthCheckResult<number> => {
  // 実装...
};

/**
 * エラーレスポンスを生成するヘルパー関数
 * @param errorCode - エラーコード
 * @param customMessage - カスタムエラーメッセージ（省略時はデフォルトメッセージを使用）
 * @param timestamp - タイムスタンプ（省略時は現在時刻を使用）
 * @returns エラーレスポンスオブジェクト
 */
export const createErrorResponse = (errorCode: ErrorCode, customMessage?: string, timestamp?: string) => {
  // 実装...
};
```

### 避けるべき表現

- 技術的に不正確な用語（「パターンマッチング風」「関数型パラダイム用」など）
- 実装詳細ではなく、機能の目的を明確に説明する

## 開発フローの基本

### 新しいAPI追加の手順

1. **スキーマ定義**: `server/api/schema/` でZodスキーマを定義
2. **ルート実装**: `server/api/routes/` でAPIを実装
3. **型定義生成**: `pnpm generate-types` で型を生成
4. **フロントエンド実装**: `app/services/` でAPI通信ロジックを作成

## 学習のポイント

### 🔰 初学者が覚えること

1. **API-First**: 仕様を先に決めてから実装する
2. **型安全性**: TypeScriptで型エラーを防ぐ
3. **自動生成**: 手動作業を減らして効率化

### ⚡ 実践のコツ

- API仕様を変更したら `pnpm generate-types` を忘れずに実行
- Swagger UIでAPIの動作を確認
- Zodスキーマでランタイム検証を活用

## 次のステップ

- 📊 [状態管理](./state-management.md) - TanStack Queryとの連携
- 🧪 [テスト](./testing.md) - APIテストの基本
- 💻 [開発ワークフロー](./development.md) - 効率的な開発手法
