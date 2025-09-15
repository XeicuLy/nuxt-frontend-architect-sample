# 📊 ハイブリッド状態管理ガイド

このプロジェクトは **TanStack Query + Pinia** のハイブリッド構成で、サーバー状態とクライアント状態を明確に分離した設計を採用しています。

## なぜハイブリッド構成なのか？

### 従来のアプローチの課題

```typescript
// ❌ 全部Piniaで管理する場合
const useTraditionalStore = defineStore('data', () => {
  const serverData = ref(null);
  const loading = ref(false);
  const userInput = ref('');

  // サーバーデータとクライアントデータが混在
  const fetchData = async () => {
    loading.value = true;
    serverData.value = await api.getData();
    loading.value = false;
  };

  // キャッシング、背景同期、エラーハンドリングを手動実装 😰
});
```

### ハイブリッドアプローチの利点

```typescript
// ✅ 責任分離されたハイブリッド構成
const useModernApproach = () => {
  return {
    ...useDataQuery(), // TanStack Query: サーバー状態に特化
    ...useUserInput(), // Pinia: クライアント状態に特化
  };
};
```

## サーバー状態管理（TanStack Query）

### 担当する状態

- **API データ**: REST API、GraphQL からのデータ
- **キャッシング**: インテリジェントなデータキャッシュ
- **同期**: バックグラウンドでのデータ更新
- **ローディング状態**: データフェッチの進行状況
- **エラーハンドリング**: ネットワークエラー、API エラー

### 実装パターン

#### 1. サービス層（API通信）

```typescript
// app/services/health.ts
import { zGetApiHealthResponse } from '#shared/types/api';

export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  const response = await $fetch<GetApiHealthResponse>('/api/health', {
    method: 'GET',
  });
  // Zodによるランタイム検証
  return zGetApiHealthResponse.parse(response);
};
```

#### 2. クエリ層（TanStack Query）

```typescript
// app/queries/useHealthQuery.ts
import { useQuery } from '@tanstack/vue-query';

export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    gcTime: 1000 * 60 * 30, // 30分間メモリ保持
  });

  return { healthQuery };
};
```

#### 3. アダプター層（データ変換）

```typescript
// app/composables/useHealth/useHealthAdapter.ts
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data, error, suspense: getHealthData } = healthQuery;

  // 画面表示用にデータを整形
  const healthStatusData = computed(() => ({
    healthStatus: data.value?.status ?? '-',
    healthTimestamp: data.value?.timestamp ?? '-',
    isHealthy: data.value?.status === 'ok',
  }));

  return {
    isLoading,
    error,
    healthStatusData,
    getHealthData,
  };
};
```

### TanStack Query の設定

```typescript
// app/plugins/vue-query.ts
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間フレッシュ
      gcTime: 1000 * 60 * 30, // 30分間メモリ保持
      refetchOnWindowFocus: false, // フォーカス時再取得無効
      refetchOnMount: true, // マウント時再取得
      retry: 1, // リトライ1回
    },
  },
});
```

### SSR対応

```typescript
// ページレベルでのデータプリロード
await handleInit();

const handleInit = async () => {
  if (isInitialClientRender.value) {
    return; // CSRの場合はスキップ
  }
  await getHealthData(); // SSRでデータ取得
};
```

## クライアント状態管理（Pinia）

### 担当する状態

- **ユーザー入力**: フォーム入力、検索クエリ
- **UI状態**: モーダルの開閉、タブの選択状態
- **ローカルデータ**: 設定、一時的なデータ
- **ナビゲーション状態**: ページネーション、フィルター

### 実装パターン

#### 1. ストア定義

```typescript
// app/store/health.ts
import { defineStore } from 'pinia';

export const useHealthStore = defineStore('health', () => {
  // 状態定義
  const input = ref('');
  const isModalOpen = ref(false);
  const filters = ref({
    category: 'all',
    sortBy: 'date',
  });

  // アクション定義
  const updateInput = (value: string): void => {
    input.value = value;
  };

  const toggleModal = (): void => {
    isModalOpen.value = !isModalOpen.value;
  };

  const updateFilters = (newFilters: Partial<typeof filters.value>): void => {
    filters.value = { ...filters.value, ...newFilters };
  };

  return {
    // 状態
    input,
    isModalOpen,
    filters,
    // アクション
    updateInput,
    toggleModal,
    updateFilters,
  };
});
```

#### 2. ストア操作層

```typescript
// app/composables/useHealth/useHealthInput.ts
export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input, isModalOpen, filters } = storeToRefs(healthStore);
  const { updateInput, toggleModal, updateFilters } = healthStore;

  // v-model対応のcomputed
  const sampleInput = computed({
    get: () => input.value,
    set: (value: string) => updateInput(value),
  });

  // 派生状態
  const hasInput = computed(() => input.value.length > 0);
  const currentFilter = computed(() => filters.value.category);

  return {
    sampleInput,
    isModalOpen,
    hasInput,
    currentFilter,
    toggleModal,
    updateFilters,
  };
};
```

### Piniaのテスト設定

```typescript
// app/helpers/test/setupTestingPinia.ts
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

export const setupTestingPinia = (initialState = {}) => {
  return createTestingPinia({
    stubActions: false, // アクションをスタブ化しない
    createSpy: vi.fn, // Vitestのspyを使用
    initialState, // 初期状態設定
  });
};
```

## 統合パターン

### コンポーザブルでの統合

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    // サーバー状態（TanStack Query）
    ...useHealthAdapter(),
    // クライアント状態（Pinia）
    ...useHealthInput(),
  };
};
```

### コンポーネントでの使用

```vue
<!-- app/components/index/Index.vue -->
<script setup lang="ts">
const {
  // サーバー状態
  isLoading,
  healthStatusData,
  getHealthData,
  // クライアント状態
  sampleInput,
  isModalOpen,
  toggleModal,
} = useHealth();
</script>

<template>
  <div>
    <!-- サーバー状態の表示 -->
    <template v-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else>
      <HealthStatusDisplayArea v-bind="healthStatusData" />
    </template>

    <!-- クライアント状態の操作 -->
    <div class="mt-4">
      <Input v-model:sample-input.lazy="sampleInput" />
      <button @click="toggleModal">{{ isModalOpen ? 'Close' : 'Open' }} Modal</button>
    </div>

    <!-- データリフレッシュ -->
    <button @click="getHealthData()" :disabled="isLoading">Refresh Health Data</button>
  </div>
</template>
```

## 実践的な使用例

### リアルタイムデータ + ユーザー設定

```typescript
// サーバー状態: リアルタイムデータ
const useRealtimeData = () => {
  return useQuery({
    queryKey: ['realtime-data'],
    queryFn: fetchRealtimeData,
    refetchInterval: 5000, // 5秒ごとに更新
  });
};

// クライアント状態: ユーザー設定
const useUserSettings = defineStore('userSettings', () => {
  const autoRefresh = ref(true);
  const refreshInterval = ref(5000);
  const theme = ref('light');

  return { autoRefresh, refreshInterval, theme };
});

// 統合
const useDashboard = () => {
  const realtimeQuery = useRealtimeData();
  const settings = useUserSettings();

  return {
    ...realtimeQuery,
    ...settings,
  };
};
```

### フォーム + API送信

```typescript
// クライアント状態: フォーム入力
const useFormInput = defineStore('form', () => {
  const formData = ref({
    name: '',
    email: '',
    message: '',
  });

  const isValid = computed(() => {
    return formData.value.name && formData.value.email;
  });

  return { formData, isValid };
});

// サーバー状態: API送信
const useFormSubmission = () => {
  return useMutation({
    mutationFn: submitFormData,
    onSuccess: () => {
      // 送信成功時の処理
    },
  });
};

// 統合
const useContactForm = () => {
  return {
    ...useFormInput(),
    ...useFormSubmission(),
  };
};
```

## パフォーマンス最適化

### TanStack Query最適化

```typescript
// 選択的なデータ取得
const useOptimizedQuery = () => {
  return useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    select: (data) => data.importantPart, // 必要な部分だけ選択
    enabled: computed(() => shouldFetch.value), // 条件付き実行
  });
};
```

### Pinia最適化

```typescript
// computedを活用した派生状態
const useOptimizedStore = defineStore('optimized', () => {
  const items = ref([]);

  // 派生状態をcomputedで効率化
  const filteredItems = computed(() => {
    return items.value.filter((item) => item.active);
  });

  const itemCount = computed(() => filteredItems.value.length);

  return { items, filteredItems, itemCount };
});
```

## デバッグとトラブルシューティング

### TanStack Query DevTools

```typescript
// 開発環境でのみDevToolsを有効化
if (process.env.NODE_ENV === 'development') {
  app.use(VueQueryDevtools);
}
```

### Pinia DevTools

```typescript
// 自動的にVue DevToolsで確認可能
// ストアの状態、アクション、タイムトラベルデバッグが利用可能
```

## 次のステップ

- 🔗 [API統合の詳細](./api-integration.md)
- 🧪 [状態管理のテスト](./testing.md)
- 💻 [開発ワークフロー](./development.md)
