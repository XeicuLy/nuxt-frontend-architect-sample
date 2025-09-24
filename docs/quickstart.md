# 🚀 クイックスタート

このガイドでは、プロジェクトをセットアップして最初のページを表示するまでの手順を説明します。

## 🐳 推奨: Dev Container でのセットアップ

最も簡単で一貫性のある開発環境を構築できます：

### 前提条件

- **Docker Desktop** または **Docker Engine**
- **Visual Studio Code**
- **Dev Containers Extension** (`ms-vscode-remote.remote-containers`)

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd nuxt-frontend-architect-sample

# 2. VS Code で開く
code .

# 3. Dev Container で再起動
# 右下の通知「Reopen in Container」をクリック
# または Cmd+Shift+P → "Dev Containers: Reopen in Container"
```

**詳細**: [📚 Dev Container 使用ガイド](./dev-container.md)

## 💻 ローカル環境でのセットアップ

### 前提条件

以下の環境が必要です：

- **Node.js** v22.16.0 以上
- **pnpm** v10.15.1 以上（推奨）

> このプロジェクトでは[Volta](https://volta.sh/)で Node.js と pnpm のバージョン管理をしています。

### インストール手順

#### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd nuxt-frontend-architect-sample
```

#### 2. 依存関係をインストール

```bash
pnpm install
```

#### 3. 開発サーバーを起動

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
2. Health Check API の仕様が表示される
3. 「Try it out」でAPIテストが可能

### ✅ エラーハンドリングが正常に動作するか

統一エラーコード体系のテスト：

**📝 注意**: デモ用に、現在のHealth APIはエラーシミュレーションが有効になっています。

```bash
# アプリでの表示確認（エラーシミュレーション有効）
# ブラウザで http://localhost:3000 を開いて確認

# APIを直接テストする場合：
# 正常ケース（シミュレーションなし）
curl "http://localhost:3000/api/health"
# → {"status":"ok","timestamp":"..."}

# エラーシミュレーション
curl "http://localhost:3000/api/health?simulate=error"
# → {"error":"Service temporarily unavailable...","errorCode":"SVR_002","timestamp":"..."}

curl "http://localhost:3000/api/health?simulate=timeout"
# → {"error":"Health check request timeout...","errorCode":"NET_002","timestamp":"..."}
```

## 開発ツールの確認

### DevTools の起動

開発サーバー起動時、以下のDevToolsが利用可能：

- **Nuxt DevTools**: 自動起動（ブラウザ右下のアイコン）
- **TanStack Query DevTools**: ブラウザに表示（サーバー状態の確認）
- **Pinia DevTools**: Vue DevTools内で利用（クライアント状態の確認）

### 型定義の生成

```bash
# OpenAPI仕様から型定義を生成
pnpm generate-types

# 生成されるファイル確認
ls shared/types/api/
# → index.ts, types.gen.ts, zod.gen.ts
```

## トラブルシューティング

### ポート3000が使用中の場合

```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>

# 再度開発サーバー起動
pnpm dev
```

### 依存関係のエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules .nuxt
pnpm install
```

### 型エラーの解決

```bash
# 型定義を再生成
pnpm generate-types

# TypeScript型チェック
pnpm typecheck
```

## 次のステップ

プロジェクトが正常に動作することが確認できたら、以下のドキュメントで詳細を学習してください：

- 🐳 [Dev Container 使用ガイド](./dev-container.md) - 統一された開発環境
- 🏗️ [アーキテクチャガイド](./architecture.md) - 設計思想と全体像
- 📊 [ハイブリッド状態管理](./state-management.md) - TanStack Query + Pinia
- 🔗 [API-First統合](./api-integration.md) - OpenAPI・型生成・エラーハンドリング
- 💻 [開発ワークフロー](./development.md) - 効率的な開発手法

## 🔰 このプロジェクトで学ぶ技術

まずは、このプロジェクトで使われている主な技術を簡単に理解しておきましょう：

### 🥰 TanStack Query

**冷蔵庫に例えると**: 自動で管理される冷蔵庫

```
・ インターネットからのデータ（食材）を自動で管理
・ 古くなったら自動で新しいデータを取得
・ 一度取得したデータは保存しておく（キャッシュ）
```

### 📋 Pinia

**メモ帳に例えると**: あなたの手書きメモ

```
・ ユーザーの入力や設定を記録
・ アプリを使っている間だけ保持
・ いつでも自由に書き換えられる
```

### 📄 OpenAPI

**郵便ルールに例えると**: 手紙の書き方ルール

```
・ どんなデータをやり取りするかのルール
・ フロントとバックが同じルールで作業
・ 間違いやすれ違いを防ぐ
```

## 学習のポイント

### 🔰 初学者が理解すべきこと

1. **ハイブリッド状態管理**: 冷蔵庫（TanStack Query）とメモ帳（Pinia）の使い分け
2. **API-First開発**: 郵便ルール（OpenAPI）を先に決める方式
3. **統一エラーハンドリング**: エラーを体系的に管理する方法

### ⚡ 効率的な学習方法

1. **DevToolsを活用**: ブラウザでリアルタイムに状態を確認
2. **エラーシミュレーション**: 様々なエラーケースをテスト
3. **型定義の確認**: 自動生成されたファイルを読んで理解を深める

---

**🎯 学習開始**: まずは [アーキテクチャガイド](./architecture.md) で全体像を把握しましょう！
