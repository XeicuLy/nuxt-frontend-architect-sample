# 🚀 クイックスタート

このガイドでは、プロジェクトをセットアップして最初のページを表示するまでの手順を説明します。

## 前提条件

以下の環境が必要です：

- **Node.js** v22.16.0 以上
- **pnpm** v10.15.1 以上（推奨）

> このプロジェクトでは[Volta](https://volta.sh/)で Node.js と pnpm のバージョン管理をしています。

## インストール手順

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd nuxt-frontend-architect-sample
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 開発サーバーを起動

```bash
pnpm dev
```

### 4. ブラウザでアクセス

- **アプリケーション**: http://localhost:3000
- **API ドキュメント**: http://localhost:3000/api/swagger
- **OpenAPI 仕様**: http://localhost:3000/api/openapi.yaml

## 初回確認項目

### ✅ アプリケーションが正常に動作しているか

1. http://localhost:3000 にアクセス
2. 「Hello, Frontend Architect Sample!」が表示される
3. Health Status が「ok」と表示される
4. 入力フィールドでテキストが入力できる

### ✅ API ドキュメントにアクセスできるか

1. http://localhost:3000/api/swagger にアクセス
2. Swagger UI が表示される
3. Health Check API をテスト実行できる

### ✅ 型定義が生成されているか

```bash
# 型定義を生成
pnpm generate-types
```

## 基本的な使い方

### よく使うコマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクション用ビルド
pnpm build

# プロダクションビルドのプレビュー
pnpm preview

# 静的サイト生成
pnpm generate

# すべてのリント・型チェック実行
pnpm lint

# 自動修正付きリント実行
pnpm lint:fix

# 型チェックのみ実行
pnpm typecheck

# API型定義生成
pnpm generate-types
```

### プロジェクト構造の概要

```
├── app/                           # Nuxtアプリケーション
│   ├── components/                # Vueコンポーネント
│   ├── composables/               # 再利用可能なコンポジション関数
│   ├── queries/                   # TanStack Query層
│   ├── store/                     # Piniaストア（クライアント状態管理）
│   ├── layouts/                   # ページレイアウト
│   ├── pages/                     # ルートページ (ファイルベースルーティング)
│   ├── services/                  # API通信・ビジネスロジック
│   └── plugins/                   # Nuxtプラグイン (TanStack Query設定)
├── server/                        # バックエンドAPI
│   └── api/
│       ├── routes/                # API ルートハンドラー
│       └── schema/                # Zodスキーマ定義
├── shared/                        # 共有リソース
│   └── types/api/                 # 自動生成された型定義とZodスキーマ
├── docs/                          # ドキュメント
└── public/                        # 静的ファイル
```

## 次のステップ

- 📖 [アーキテクチャ](./architecture.md) - プロジェクトの設計思想を理解する
- 🔗 [API統合](./api-integration.md) - API-First開発について学ぶ
- 📊 [状態管理](./state-management.md) - TanStack Query + Pinia の使い方
- 💻 [開発フロー](./development.md) - 効率的な開発手法
- 🧪 [テスト](./testing.md) - テスト戦略と実践

## トラブルシューティング

問題が発生した場合は、[トラブルシューティングガイド](./troubleshooting.md) を参照してください。
