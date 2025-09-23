# 🏠 アーキテクチャを理解しよう

初学者向けに、このプロジェクトの設計を**家の設計**に例えて分かりやすく説明します。

## 🏠 家の設計に例えると

このプロジェクトは**2階建ての家**のような設計です：

### 🟦 1階：インフラ設備（サーバー状態）

```
💧 水道    = インターネットからのデータ
⚡ 電気    = API通信
🔥 ガス    = データの加工・変換
🌡️ 空調    = キャッシュ管理

担当: TanStack Query
```

### 🟨 2階：住人のスペース（クライアント状態）

```
📋 メモ    = ユーザーの入力
🎨 装飾    = UIの状態（モーダル開閉など）
📦 私物    = ローカル設定
🔍 検索    = フィルター情報

担当: Pinia
```

### なぜこの設計なの？

#### 🟦 1階（インフラ）の役割

- 家全体に水や電気を供給
- 住人が意識しなくても自動で動く
- メンテナンスは専門業者が担当

#### 🟨 2階（住人スペース）の役割

- 住人が直接操作するもの
- 個人の好みでカスタマイズ
- 即座に変更できる

## このプロジェクトの特徴

### 🏗️ モノレポ構成（一つの家に全部ある）

- **フロントエンド**：家の内装（見た目・操作）
- **バックエンド**：家のインフラ（データ処理）
- **共有型定義**：建築設計図（共通ルール）

### 🔗 API-First設計（設計図を先に作る）

- 先に「どんなデータをやり取りするか」を決める
- フロントとバックが同じルールで作業
- 間違いやすれ違いがない

### 🤝 ハイブリッド状態管理（役割分担）

「1階はインフラ、２階は住人」のように、役割を明確に分ける

## アーキテクチャ概要図

```mermaid
sequenceDiagram
  participant U as 👤 User
  participant C as 🎨 Component
  participant UH as 🔗 useHealth<br/>(統合インターフェース)
  participant HA as 🔄 useHealthAdapter<br/>(サーバー状態)
  participant HI as 📝 useHealthInput<br/>(クライアント状態)
  participant Q as 📡 TanStack Query<br/>(キャッシュ管理)
  participant S as 🏪 Pinia Store<br/>(ローカル状態)
  participant API as 🖥️ /api/health

  note over U, API: 🌐 サーバー状態フロー（API データ）
  U->>C: ページアクセス
  C->>UH: useHealth() - 統合状態取得
  UH->>HA: useHealthAdapter() - サーバー状態
  HA->>Q: useHealthQuery() - データ取得
  Q->>API: HTTP Request
  API-->>Q: Response with validation
  Q-->>HA: Cached data
  HA-->>UH: Transformed data

  note over U, API: 💻 クライアント状態フロー（ユーザー入力）
  UH->>HI: useHealthInput() - クライアント状態
  HI->>S: Pinia Store access
  S-->>HI: Reactive state
  HI-->>UH: UI state data

  note over U, API: 🖼️ 統合表示
  UH-->>C: {serverState, clientState}
  C-->>U: 統合されたUI表示
```

## 状態管理アーキテクチャ

### サーバー状態管理（TanStack Query）

**責任範囲**: API データ、キャッシング、バックグラウンド同期

```
📡 API通信 → 🗄️ クエリ管理 → 🔄 データ変換 → 🎨 コンポーネント
   ↓              ↓               ↓
services/      queries/     composables/
```

#### 1. API通信層 (`app/services/`)

```typescript
// HTTP通信とZodによるデータ検証
export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  const response = await $fetch<GetApiHealthResponse>('/api/health');
  return zGetApiHealthResponse.parse(response); // ランタイム検証
};
```

#### 2. クエリ層 (`app/queries/`)

```typescript
// TanStack Queryでキャッシングと状態管理
export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi, // サービス層を使用
  });
  return { healthQuery };
};
```

#### 3. アダプター層 (`app/composables/`)

```typescript
// APIデータを画面表示用に変換
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data, suspense: getHealthData } = healthQuery;

  // 表示用データ変換
  const healthStatusData = computed(() => ({
    healthStatus: data.value?.status ?? '-',
    healthTimestamp: data.value?.timestamp ?? '-',
  }));

  return { isLoading, healthStatusData, getHealthData };
};
```

### クライアント状態管理（Pinia）

**責任範囲**: ユーザー入力、UI状態、ローカルデータ

```
🏪 ストア定義 → 🔧 ストア操作 → 🎨 コンポーネント
     ↓              ↓
   store/      composables/
```

#### 1. ストア層 (`app/store/`)

```typescript
// Composition API スタイルのストア定義
export const useHealthStore = defineStore('health', () => {
  const input = ref('');
  const updateInput = (value: string): void => {
    input.value = value;
  };
  return { input, updateInput };
});
```

#### 2. ストア操作層 (`app/composables/`)

```typescript
// ストアアクセスとデータ変換
export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input } = storeToRefs(healthStore);
  const { updateInput } = healthStore;

  // v-model対応のcomputed
  const sampleInput = computed({
    get: () => input.value,
    set: (value: string) => updateInput(value),
  });

  return { sampleInput };
};
```

### 統合インターフェース

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(), // サーバー状態（API データ）
    ...useHealthInput(), // クライアント状態（ユーザー入力）
  };
};
```

## コンポーネントアーキテクチャ

### 統合状態の使用

```vue
<!-- app/components/index/Index.vue -->
<script setup lang="ts">
const {
  isLoading, // TanStack Query から
  healthStatusData, // TanStack Query から
  sampleInput, // Pinia から
} = useHealth();
</script>

<template>
  <div>
    <template v-if="isLoading">Loading...</template>
    <template v-else>
      <!-- サーバー状態の表示 -->
      <HealthStatusDisplayArea v-bind="healthStatusData" />
      <!-- クライアント状態（ユーザー入力） -->
      <Input v-model:sample-input.lazy="sampleInput" />
    </template>
  </div>
</template>
```

## この設計の利点

### 🎯 明確な責任分離

```typescript
// ❌ 従来のアプローチ: 全部混在
const useEverything = () => {
  // HTTP通信、キャッシング、ユーザー入力、データ変換が混在
  // 150行を超える複雑なコード😵
};

// ✅ ハイブリッドアプローチ: 責任ごとに分離
const getHealthApi = () => {
  /* HTTP通信だけ */
};
const useHealthQuery = () => {
  /* キャッシングだけ */
};
const useHealthStore = () => {
  /* ユーザー入力だけ */
};
const useHealthAdapter = () => {
  /* データ変換だけ */
};
const useHealth = () => {
  /* 統合だけ */
};
```

### 📈 開発・保守の利点

- **問題を見つけやすい**:
  - 通信エラー → `services/` を確認
  - キャッシュ問題 → `queries/` を確認
  - ユーザー入力問題 → `store/` を確認
  - 表示データ問題 → `composables/` を確認

- **使い回しやすい**: 各層は独立しており、別の画面でも再利用可能

- **テストしやすい**: 各層を個別にテストできる

- **拡張しやすい**: 新機能は各フォルダにファイルを追加するだけ

### 🚀 パフォーマンス最適化

- **TanStack Query**:
  - 5分間のインテリジェントキャッシング
  - バックグラウンドでのデータ同期
  - 重複リクエストの除去

- **Pinia**:
  - 軽量なクライアント状態管理
  - リアクティブな状態更新
  - DevTools サポート

- **SSR対応**:
  - サーバー側でのデータプリロード
  - クライアント側でのハイドレーション
  - 初回表示の高速化

## API-First アーキテクチャ

### 開発フロー

```mermaid
flowchart LR
  A[OpenAPI仕様定義] --> B[Zodスキーマ生成]
  B --> C[TypeScript型生成]
  C --> D[フロントエンド実装]
  D --> E[型安全な通信]

  A --> F[Swagger UI]
  F --> G[API テスト]
```

### 型安全性の実現

1. **OpenAPI 仕様** → 信頼できる情報源
2. **Zod スキーマ** → ランタイム検証
3. **TypeScript 型** → コンパイル時チェック
4. **自動生成** → 手動作業によるエラー排除

## 次のステップ

- 📊 [状態管理の詳細](./state-management.md)
- 🔗 [API統合の実践](./api-integration.md)
- 🧪 [アーキテクチャのテスト](./testing.md)
