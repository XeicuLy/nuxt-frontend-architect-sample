# Nuxt 4 + Hono + TanStack Query + Pinia フルスタックプロジェクト概要（最新実装）

## 技術スタック

### フロントエンド

- **Nuxt 4** (4.1.1) - フルスタック Vue.js フレームワーク
- **Vue 3** (3.5.21) - UI フレームワーク
- **TanStack Query** (@tanstack/vue-query v5.87.1) - **サーバー状態管理**・データフェッチング・キャッシング
- **Pinia** (v3.0.3) - **クライアント状態管理**・UI状態・ユーザー入力
- **@pinia/nuxt** (0.11.2) - Pinia Nuxt統合
- **@pinia/testing** (1.0.2) - Piniaテスト用ユーティリティ
- **TypeScript** (5.9.2) - 型安全性
- **Tailwind CSS** - スタイリング

### バックエンド

- **Hono** (4.9.6) - 軽量高速 Web フレームワーク
- **OpenAPI** - API仕様書とSwagger UI
- **Zod** (4.1.5) - スキーマ検証

### 開発ツール

- **Biome** (2.2.3) - リンター・フォーマッター
- **ESLint** (9.35.0) - 静的解析
- **Prettier** (3.6.2) - フォーマッター
- **@hey-api/openapi-ts** (0.82.4) - 型定義自動生成
- **Vitest** - テストフレームワーク
- **@nuxt/test-utils** - Nuxtテスト用ユーティリティ

## 現在の実装構造

```
├── app/                           # Nuxtアプリケーション
│   ├── store/                     # 🆕 Piniaストア（クライアント状態管理）
│   │   └── health.ts             # ヘルスチェック用クライアント状態
│   ├── queries/                   # TanStack Query層
│   │   └── useHealthQuery.ts     # ヘルスチェック用クエリ
│   ├── composables/               # 統合アダプター層
│   │   ├── common/               # 共通ユーティリティ
│   │   └── useHealth/            # ヘルスチェック機能
│   │       ├── useHealthAdapter.ts   # サーバー状態変換
│   │       ├── useHealthInput.ts     # 🆕 クライアント状態操作
│   │       └── index.ts              # 統合インターフェース
│   ├── components/
│   │   └── index/
│   │       ├── Input.vue         # 🆕 ユーザー入力コンポーネント
│   │       └── ...
│   ├── services/                 # API通信・ビジネスロジック
│   ├── helpers/test/             # テストヘルパー
│   │   └── setupTestingPinia.ts  # 🆕 Piniaテスト設定
│   └── ...
```

## 現在のハイブリッド状態管理アーキテクチャ

### ⚠️ 重要な実装更新

**TanStack Query + Pinia のハイブリッド構成**

- **TanStack Query**: サーバー状態（API データ、キャッシング、同期）に特化
- **Pinia**: クライアント状態（ユーザー入力、UI状態、ローカルデータ）に特化
- **明確な分離**: サーバーとクライアント状態の関心事を完全に分離
- **統合インターフェース**: コンポーネントは単一のcomposableで両方にアクセス

### データフロー実装例

#### サーバー状態フロー（TanStack Query）

```typescript
// 1. API通信 (app/services/health.ts)
export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  const response = await $fetch<GetApiHealthResponse>('/api/health');
  return zGetApiHealthResponse.parse(response);
};

// 2. クエリ定義 (app/queries/useHealthQuery.ts)
export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });
  return { healthQuery };
};

// 3. アダプター (app/composables/useHealth/useHealthAdapter.ts)
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data, suspense: getHealthData } = healthQuery;

  const healthStatusData = computed(() => ({
    healthStatus: data.value?.status ?? '-',
    healthTimestamp: data.value?.timestamp ?? '-',
  }));

  return { isLoading, getHealthData, healthStatusData };
};
```

#### クライアント状態フロー（Pinia）

```typescript
// 1. ストア定義 (app/store/health.ts)
export const useHealthStore = defineStore('health', () => {
  const input = ref('');
  const updateInput = (value: string): void => {
    input.value = value;
  };
  return { input, updateInput };
});

// 2. ストア操作 (app/composables/useHealth/useHealthInput.ts)
export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input } = storeToRefs(healthStore);
  const { updateInput } = healthStore;

  const sampleInput = computed({
    get: () => input.value,
    set: (value: string) => updateInput(value),
  });

  return { sampleInput };
};
```

#### 統合インターフェース

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(), // サーバー状態
    ...useHealthInput(), // クライアント状態
  };
};
```

#### コンポーネントでの使用

```vue
<!-- app/components/index/Index.vue -->
<script setup lang="ts">
const {
  isLoading, // サーバー状態
  healthStatusData, // サーバー状態
  sampleInput, // クライアント状態
} = useHealth();
</script>

<template>
  <div>
    <template v-if="isLoading">Loading...</template>
    <template v-else>
      <!-- サーバーデータ表示 -->
      <HealthStatusDisplayArea v-bind="healthStatusData" />
      <!-- クライアント状態（ユーザー入力） -->
      <Input v-model:sample-input.lazy="sampleInput" />
    </template>
  </div>
</template>
```

## テスト実装

### Piniaテストサポート

```typescript
// app/helpers/test/setupTestingPinia.ts
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

export const setupTestingPinia = (initialState = {}) => {
  return createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    initialState,
  });
};
```

## SSR/SSG対応

- **TanStack Query plugin**: `app/plugins/vue-query.ts`でSSR対応
- **useRenderEnvironment**: サーバー・クライアント判定
- **データハイドレーション**: 自動的にSSR→CSR移行
- **Pinia SSR**: クライアント状態のSSR対応（必要に応じて）

## コマンド

- `pnpm dev` - 開発サーバー起動
- `pnpm generate-types` - API型定義生成
- `pnpm lint` - コード品質チェック
- `pnpm test` - テスト実行
- `pnpm build` - プロダクションビルド

## アーキテクチャの利点

### 分離された関心事

- **サーバー状態**: API通信、キャッシング、背景同期に特化
- **クライアント状態**: UI操作、ユーザー入力、ローカル状態に特化
- **テスト分離**: 各状態管理を独立してテストできる

### パフォーマンス最適化

- **TanStack Query**: サーバーデータの効率的なキャッシングと同期
- **Pinia**: 軽量なクライアント状態管理
- **SSR対応**: 初回ロード時のパフォーマンス最適化

### 開発効率

- **統一インターフェース**: コンポーネントは単一のcomposableで全状態にアクセス
- **型安全性**: TypeScriptによるエンドツーエンドの型安全性
- **テスト性**: 各層を独立してテストできる設計
