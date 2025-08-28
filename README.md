# Nuxt 3 フロントエンドアーキテクト サンプル

## 📖 プロジェクト概要

このプロジェクトは、**Nuxt 3** を使用したモダンなフルスタックWeb開発のサンプルプロジェクトです。初学者がNuxt 3の基本的な使い方から、プロダクションレベルの開発手法まで学べる構成になっています。

### 🎯 このプロジェクトで学べること

- **Nuxt 3** での基本的なWebアプリケーション開発
- **TypeScript** を使った型安全な開発
- **API-First開発** の実践（OpenAPI + Zod）
- **モダンな開発ツール** の導入と使い方
- **フルスタック** での開発アプローチ

### 🛠️ 技術スタック

#### フロントエンド

- **[Nuxt 3](https://nuxt.com/)** - フルスタックVue.jsフレームワーク
- **[Vue 3](https://vuejs.org/)** - プログレッシブJavaScriptフレームワーク
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全な開発
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファーストCSSフレームワーク
- **[Pinia](https://pinia.vuejs.org/)** - Vue 3向け状態管理ライブラリ

#### バックエンド

- **[Hono](https://hono.dev/)** - 高速軽量なWebフレームワーク
- **[Zod](https://zod.dev/)** - TypeScript向けスキーマ検証ライブラリ
- **OpenAPI** - API仕様書の自動生成

#### 開発ツール

- **[Biome](https://biomejs.dev/)** - 高速リンター・フォーマッター
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript静的解析ツール
- **[Prettier](https://prettier.io/)** - コードフォーマッター
- **[@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts)** - TypeScript型定義自動生成

### 🏗️ アーキテクチャの特徴

- **モノレポ構成**: フロントエンド、バックエンド、共有型定義を統合管理
- **API-First開発**: OpenAPI仕様からTypeScript型定義を自動生成
- **型安全な通信**: フロントエンド⇔バックエンド間の完全な型安全性
- **コンポーザブル設計**: 再利用可能なロジックの分離
- **モダンツールチェーン**: 開発効率を最大化する最新ツール

## 🚀 クイックスタート

### 前提条件

以下の環境が必要です：

- **Node.js** v24.6.0 以上
- **pnpm** v10.15.0 以上（推奨）

> このプロジェクトでは[Volta](https://volta.sh/)で Node.js と pnpm のバージョン管理をしています。

### セットアップ

1. **リポジトリをクローン**

   ```bash
   git clone <repository-url>
   cd nuxt-frontend-architect-sample
   ```

2. **依存関係をインストール**

   ```bash
   pnpm install
   ```

3. **開発サーバーを起動**

   ```bash
   pnpm dev
   ```

4. **ブラウザでアクセス**
   - アプリケーション: http://localhost:3000
   - API ドキュメント: http://localhost:3000/api/swagger
   - OpenAPI 仕様: http://localhost:3000/api/openapi.json

## 📁 プロジェクト構造

```
├── app/                      # Nuxtアプリケーション
│   ├── components/           # Vueコンポーネント
│   ├── composables/          # 再利用可能なコンポジション関数
│   ├── layouts/              # ページレイアウト
│   ├── pages/                # ルートページ (ファイルベースルーティング)
│   ├── services/             # ビジネスロジック・API通信
│   ├── store/                # Pinia状態管理
│   └── assets/css/           # スタイルシート
├── server/                   # バックエンドAPI
│   └── api/
│       ├── routes/           # API ルートハンドラー
│       └── schema/           # Zodスキーマ定義
├── shared/                   # 共有リソース
│   └── types/api/            # 自動生成された型定義
└── public/                   # 静的ファイル
```

### 主要ファイルの役割

| ファイル               | 役割                                   |
| ---------------------- | -------------------------------------- |
| `nuxt.config.ts`       | Nuxtの設定ファイル                     |
| `package.json`         | プロジェクトの依存関係と実行スクリプト |
| `openapi-ts.config.ts` | TypeScript型定義の自動生成設定         |
| `app.vue`              | アプリケーションのルートコンポーネント |

## ⚡ よく使うコマンド

### 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクション用ビルド
pnpm build

# プロダクションビルドのプレビュー
pnpm preview

# 静的サイト生成
pnpm generate
```

### コード品質管理

```bash
# すべてのリント・型チェック実行
pnpm lint

# 自動修正付きリント実行
pnpm lint:fix

# 型チェックのみ実行
pnpm typecheck
```

### API型定義の生成

```bash
# OpenAPIからTypeScript型定義を生成
pnpm generate-types
```

## 🔧 API型定義とZodスキーマの使い方

このプロジェクトでは、[openapi-ts](https://github.com/hey-api/openapi-ts)を使用してAPIの型定義とZodスキーマを自動生成しています。

### 概要

- APIスキーマから TypeScript の型定義と Zod スキーマを自動生成
- 生成されたファイルは `shared/types/api/` ディレクトリに配置
- フロントエンドでの API レスポンスの型安全性とランタイムバリデーションを提供

### 生成されるファイル

```
shared/types/api/
├── index.ts       # エクスポート用のインデックスファイル
├── types.gen.ts   # TypeScript型定義
└── zod.gen.ts     # Zodスキーマ定義
```

### 使用例

#### 1. 基本的な型の使用（現在のコード例）

```typescript
// services/useHealthService.ts
import type { GetApiHealthResponse } from '#shared/types/api';

export const useHealthService = () => {
  const getHealthApi = async () => {
    const { data } = await useFetch<GetApiHealthResponse>('/api/health', {
      method: 'GET',
    });
    return data.value;
  };

  return { getHealthApi };
};
```

#### 2. Zodスキーマを使ったランタイムバリデーション

```typescript
// services/useHealthServiceWithValidation.ts
import { zGetApiHealthResponse } from '#shared/types/api';

export const useHealthServiceWithValidation = () => {
  const getHealthApi = async () => {
    const response = await $fetch('/api/health');

    // APIレスポンスをZodスキーマで検証
    const validatedData = zGetApiHealthResponse.parse(response);

    return validatedData;
  };

  return { getHealthApi };
};
```

#### 3. セーフパース（エラーハンドリング付き）

```typescript
import { zGetApiHealthResponse } from '#shared/types/api';

const response = await $fetch('/api/health');
const result = zGetApiHealthResponse.safeParse(response);

if (result.success) {
  console.log('有効なデータ:', result.data);
} else {
  console.error('バリデーションエラー:', result.error);
}
```

### スキーマの再生成

APIスキーマが更新された場合は、以下のコマンドで型定義を再生成できます：

```bash
pnpm generate-types
```

## 🎨 Nuxt 3 の基本的な使い方

### ページの追加

ファイルベースルーティングを使用しているため、`app/pages/` にVueファイルを追加するだけで新しいページを作成できます。

```vue
<!-- app/pages/about.vue -->
<template>
  <div>
    <h1>About Page</h1>
    <p>このページについて説明します。</p>
  </div>
</template>
```

上記のファイルを作成すると、`http://localhost:3000/about` でアクセスできるようになります。

### コンポーネントの作成

`app/components/` ディレクトリにコンポーネントを作成すると、自動的にインポートされて使用できます。

```vue
<!-- app/components/HelloWorld.vue -->
<template>
  <div class="hello">
    <h2>{{ message }}</h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string;
}

defineProps<Props>();
</script>
```

```vue
<!-- app/pages/index.vue -->
<template>
  <div>
    <HelloWorld message="こんにちは、Nuxt 3！" />
  </div>
</template>
```

### コンポーザブルの使用

`app/composables/` ディレクトリに作成したコンポーザブルは、自動的にインポートされます。

```typescript
// app/composables/useCounter.ts
export const useCounter = () => {
  const count = ref(0);

  const increment = () => {
    count.value++;
  };

  const decrement = () => {
    count.value--;
  };

  return {
    count: readonly(count),
    increment,
    decrement,
  };
};
```

```vue
<!-- ページやコンポーネントで使用 -->
<template>
  <div>
    <p>カウント: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup lang="ts">
const { count, increment, decrement } = useCounter();
</script>
```

## 🛠️ 開発フロー

### 1. 新機能の開発手順

1. **ブランチの作成**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **API仕様の定義** (必要な場合)
   - `server/api/schema/` でZodスキーマを定義
   - `server/api/routes/` でAPIエンドポイントを実装

3. **型定義の生成**

   ```bash
   pnpm generate-types
   ```

4. **フロントエンドの実装**
   - Services → Store → Components の順で実装
   - コンポーザブルで再利用可能なロジックを分離

5. **コード品質チェック**
   ```bash
   pnpm lint
   ```

### 2. デバッグ手法

- **Nuxt DevTools**: ブラウザ内でコンポーネント構造や状態を確認
- **Vue DevTools**: Vue.js専用のブラウザ拡張機能
- **コンソールログ**: `console.log()` を使ったシンプルなデバッグ
- **型エラー確認**: `pnpm typecheck` でTypeScriptエラーを早期発見

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. 開発サーバーが起動しない

```bash
# ポートが既に使用されている場合
pnpm dev --port 3001

# node_modules を再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. 型エラーが発生する

```bash
# 型定義を再生成
pnpm generate-types

# TypeScript型チェック実行
pnpm typecheck
```

#### 3. ESLint/Prettier エラー

```bash
# 自動修正を実行
pnpm lint:fix

# 個別に修正
pnpm eslint:fix
pnpm biome:fix
pnpm prettier:fix
```

#### 4. ホットリロードが動作しない

- ブラウザのキャッシュをクリア
- 開発サーバーを再起動: `Ctrl+C` → `pnpm dev`

## 📚 参考リンク

- [Nuxt 3 公式ドキュメント](https://nuxt.com/docs)
- [Vue 3 公式ドキュメント](https://vuejs.org/guide/)
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)
- [Pinia 公式ドキュメント](https://pinia.vuejs.org/)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## MCP Setup

```bash
claude mcp add playwright npx @playwright/mcp@latest

claude mcp add context7 -- npx --yes @upstash/context7-mcp

claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project $(pwd)
```
