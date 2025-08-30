# Nuxt 4 + Hono + TanStack Query フルスタックプロジェクト概要

## 技術スタック

### フロントエンド

- **Nuxt 4** (4.0.3) - フルスタック Vue.js フレームワーク
- **Vue 3** (3.5.18) - UI フレームワーク
- **TanStack Query** (@tanstack/vue-query v5.85.5) - データフェッチング・キャッシング
- **TypeScript** (5.9.2) - 型安全性
- **Tailwind CSS** - スタイリング
- **Pinia** (3.0.3) - 状態管理

### バックエンド

- **Hono** (4.9.4) - 軽量高速 Web フレームワーク
- **OpenAPI** - API仕様書とSwagger UI
- **Zod** (4.1.0) - スキーマ検証

### 開発ツール

- **Biome** - リンター・フォーマッター
- **ESLint** - 静的解析
- **Prettier** - フォーマッター
- **@hey-api/openapi-ts** - 型定義自動生成

## プロジェクト構造

```
├── app/                      # Nuxt アプリケーション
│   ├── plugins/vue-query.ts  # TanStack Query プラグイン
│   ├── services/             # API 通信サービス
│   └── ...
├── server/                   # Hono API
│   └── api/
│       ├── index.ts          # メイン API ハンドラ
│       ├── routes/           # API ルート
│       └── schema/           # Zod スキーマ
├── shared/                   # 共有リソース
│   └── types/api/            # 自動生成型定義
└── ...
```

## 主な特徴

1. **API-First 開発**: OpenAPI → TypeScript 型定義自動生成
2. **型安全な通信**: フロントエンド⇔バックエンド完全型安全性
3. **効率的データ管理**: TanStack Query による SSR 対応キャッシング
4. **高性能 API**: Hono による軽量で高速な API
5. **モノレポ構成**: 統合プロジェクト管理

## コマンド

- `pnpm dev` - 開発サーバー起動
- `pnpm generate-types` - API型定義生成
- `pnpm lint` - コード品質チェック
- `pnpm build` - プロダクションビルド

## READMEの更新内容

2025年8月30日にREADMEを以下の内容で更新：

1. タイトルを「Nuxt 4 + Hono + TanStack Query フルスタック サンプル」に変更
2. TanStack Query の技術スタックとアーキテクチャ特徴を追加
3. TanStack Query の使用方法とコード例を追加
4. TanStack Query のプラグイン設定説明を追加
5. 参考リンクにHono、TanStack Queryを追加
