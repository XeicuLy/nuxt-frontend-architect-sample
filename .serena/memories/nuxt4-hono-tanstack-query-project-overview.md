# Nuxt 4 + Hono + TanStack Query フルスタックプロジェクト概要（最新）

## 技術スタック

### フロントエンド

- **Nuxt 4** (4.1.1) - フルスタック Vue.js フレームワーク
- **Vue 3** (3.5.21) - UI フレームワーク
- **TanStack Query** (@tanstack/vue-query v5.87.1) - **主要な状態管理**・データフェッチング・キャッシング
- **TypeScript** (5.9.2) - 型安全性
- **Tailwind CSS** - スタイリング
- **Pinia** (3.0.3) - **現在未実装**（将来的なクライアント状態管理用）

### バックエンド

- **Hono** (4.9.6) - 軽量高速 Web フレームワーク
- **OpenAPI** - API仕様書とSwagger UI
- **Zod** (4.1.5) - スキーマ検証

### 開発ツール

- **Biome** (2.2.3) - リンター・フォーマッター
- **ESLint** (9.35.0) - 静的解析
- **Prettier** (3.6.2) - フォーマッター
- **@hey-api/openapi-ts** (0.82.4) - 型定義自動生成

## 実際のプロジェクト構造

```
├── app/                           # Nuxtアプリケーション
│   ├── components/                # Vueコンポーネント
│   │   └── index/                 # インデックスページ用コンポーネント
│   ├── composables/               # 再利用可能なコンポジション関数
│   │   ├── common/                # 共通ユーティリティ
│   │   └── useHealth/             # ヘルスチェック機能
│   ├── layouts/                   # ページレイアウト
│   ├── pages/                     # ルートページ (ファイルベースルーティング)
│   ├── services/                  # API通信・ビジネスロジック
│   ├── plugins/                   # Nuxtプラグイン (TanStack Query設定)
│   ├── helpers/test/              # テストヘルパー
│   ├── types/                     # 型定義
│   └── assets/css/                # スタイルシート
├── server/                        # Hono API
├── shared/                        # 共有リソース
│   └── types/api/                 # 自動生成型定義
└── public/                        # 静的ファイル
```

## 現在の状態管理アーキテクチャ

### ⚠️ 重要な実装詳細

**TanStack Query のみで状態管理**

- 現在は**Piniaストアは一切実装されていない**
- 全ての状態管理をTanStack Queryで実行
- `app/plugins/vue-query.ts` でSSR対応設定
- `app/composables/useHealth/` でクエリロジック実装
- `app/services/health.ts` でAPI通信とZodバリデーション

**Adapterパターンの採用**

- `useHealthQuery`: TanStack Queryの直接使用
- `useHealthAdapter`: データ変換・ビジネスロジック
- `useHealth`: 両者を統合したメインAPI
- コンポーネントはpropsでデータを受け取る設計

## 実装例

### TanStack Query + Adapterパターン

```typescript
// app/composables/useHealth/useHealthQuery.ts
export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });
  return { healthQuery };
};

// app/composables/useHealth/useHealthAdapter.ts
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data: healthData, suspense: getHealthData } = healthQuery;

  const healthStatusData = computed<HealthStatusData>(() => ({
    healthStatus: healthData.value?.status ?? '-',
    healthTimestamp: healthData.value?.timestamp ?? '-',
  }));

  return { isLoading, healthStatusData, getHealthData };
};

// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(),
    ...useHealthQuery(),
  };
};
```

### 実際のコンポーネント使用方法

```typescript
// app/pages/index.vue
const { getHealthData } = useHealth();
await handleInit(); // SSR対応

// app/components/index/Index.vue
const { isLoading, healthStatusData } = useHealth();

// app/components/index/HealthStatusDisplayArea.vue
// Propsでデータを受け取るのみ
defineProps<HealthStatusData>();
```

## SSR/SSG対応

- **TanStack Query plugin**: `app/plugins/vue-query.ts`
- **useRenderEnvironment**: サーバー・クライアント判定
- **データハイドレーション**: 自動的にSSR→CSR移行

## コマンド

- `pnpm dev` - 開発サーバー起動
- `pnpm generate-types` - API型定義生成
- `pnpm lint` - コード品質チェック
- `pnpm build` - プロダクションビルド
