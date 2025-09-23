# 🐳 Dev Container 使用ガイド

## 概要

このプロジェクトでは、開発環境の統一とGitHub Copilot AI Agentでの作業効率向上のため、Dev Containerを用いた標準化された開発環境を提供しています。

## 🎯 メリット

- **環境統一**: 全ての開発者が同じ環境で作業できる
- **簡単セットアップ**: ワンクリックで開発環境が構築される
- **GitHub Copilot AI Agent対応**: 一貫した環境での作業により精度向上
- **依存関係管理**: 必要なツール・拡張機能が自動でインストールされる

## 📋 前提条件

以下のツールがインストールされている必要があります：

- **Docker Desktop** または **Docker Engine**
- **Visual Studio Code**
- **Dev Containers Extension** (`ms-vscode-remote.remote-containers`)

### Docker Desktop のインストール

#### Windows/macOS

[Docker Desktop](https://www.docker.com/products/docker-desktop/) からダウンロードしてインストール

#### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### VS Code Extensions

```bash
# Dev Containers拡張機能をインストール
code --install-extension ms-vscode-remote.remote-containers
```

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/XeicuLy/nuxt-frontend-architect-sample.git
cd nuxt-frontend-architect-sample
```

### 2. Dev Container で開く

#### 方法1: VS Code コマンドパレット

1. VS Code でプロジェクトフォルダを開く
2. `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (macOS)
3. `Dev Containers: Reopen in Container` を実行

#### 方法2: 通知から選択

1. VS Code でプロジェクトフォルダを開く
2. 右下に表示される「Reopen in Container」をクリック

#### 方法3: コマンドライン

```bash
code --remote containerApp .
```

### 3. 初期セットアップ完了を待つ

Dev Container起動時、以下が自動実行されます：

```bash
# 1. Node.js 22.16.0とpnpm 10.15.1のセットアップ
npm install -g pnpm@10.15.1

# 2. 依存関係のインストール
pnpm install

# 3. API型定義の生成
pnpm generate-types
```

**⏱️ 初回起動は5-10分程度かかります。**

## 🛠️ 開発ワークフロー

### 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは自動的にポート転送され、ローカルの `http://localhost:3000` でアクセス可能です。

### よく使用するコマンド

```bash
# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test

# リント・フォーマット
pnpm lint:fix

# ビルド
pnpm build

# 型定義生成
pnpm generate-types
```

### アクセス可能なURL

- **アプリケーション**: http://localhost:3000
- **API ドキュメント**: http://localhost:3000/api/swagger
- **OpenAPI仕様**: http://localhost:3000/api/openapi.yaml
- **ヘルスチェック**: http://localhost:3000/api/health

## 🔧 設定詳細

### インストールされる拡張機能

#### コア開発ツール

- **Biome** (`biomejs.biome`): リント・フォーマット
- **Prettier** (`esbenp.prettier-vscode`): コードフォーマット
- **ESLint** (`ms-vscode.vscode-eslint`): JavaScriptリント
- **Tailwind CSS** (`bradlc.vscode-tailwindcss`): CSSユーティリティ

#### Vue.js エコシステム

- **Volar** (`Vue.volar`): Vue 3サポート
- **Vue TypeScript Plugin** (`Vue.vscode-typescript-vue-plugin`)

#### 開発支援

- **Vitest Explorer** (`vitest.explorer`): テスト実行
- **OpenAPI Support** (`42crunch.vscode-openapi`): API仕様
- **GitHub Copilot** (`GitHub.copilot`): AI支援
- **GitHub Copilot Chat** (`GitHub.copilot-chat`): AI対話

### 環境変数

```bash
NODE_ENV=development
VOLTA_NODE_VERSION=22.16.0
VOLTA_PNPM_VERSION=10.15.1
```

### ポート転送

- **3000**: Nuxtアプリケーション（自動転送）

## 🐛 トラブルシューティング

### Docker関連の問題

#### 問題1: Docker Desktopが起動しない

```bash
# Docker の状態確認
docker version
docker info

# Docker Desktop再起動
# Windows: システムトレイから再起動
# macOS: アプリケーションから再起動
```

#### 問題2: コンテナビルドエラー

```bash
# Docker キャッシュクリア
docker system prune -a

# Dev Container の完全リビルド
# VS Code: Cmd+Shift+P → "Dev Containers: Rebuild Container"
```

### 拡張機能の問題

#### 問題1: 拡張機能が正しく動作しない

```bash
# VS Code で拡張機能を再読み込み
# Cmd+Shift+P → "Developer: Reload Window"
```

#### 問題2: TypeScript/Vue拡張機能の不具合

```bash
# コンテナ内でTypeScriptサーバー再起動
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### パフォーマンスの問題

#### 問題1: 起動が遅い

- **原因**: 初回ビルド時はイメージダウンロードに時間がかかる
- **解決策**: 2回目以降は高速化される

#### 問題2: ファイル変更検知が遅い

```bash
# ファイル監視設定の確認
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 依存関係の問題

#### 問題1: pnpm install エラー

```bash
# コンテナ内でキャッシュクリア
rm -rf node_modules .nuxt
pnpm install
```

#### 問題2: 型定義エラー

```bash
# 型定義の再生成
pnpm generate-types
pnpm typecheck
```

## 🤖 GitHub Copilot AI Agent 利用時の注意点

### 最適化のポイント

1. **環境の一貫性**: Dev Containerにより全てのAI Agentが同じ環境で作業
2. **ツール統一**: 共通のリント・フォーマット設定によりコード品質保持
3. **型定義**: 自動生成された型定義によりより正確なコード生成

### 推奨設定

```json
// .vscode/settings.json (Dev Container内で自動設定)
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": false,
    "markdown": true
  }
}
```

### AI Agentでの作業フロー

1. **環境確認**: Dev Container内で作業していることを確認
2. **型定義生成**: 変更前に `pnpm generate-types` 実行
3. **テスト実行**: 変更後に `pnpm test` で検証
4. **品質チェック**: `pnpm lint:fix` でコード品質保持

## 🔄 Dev Container 更新

### 設定変更時

```bash
# VS Code コマンドパレット
# "Dev Containers: Rebuild Container"
```

### Node.js/pnpmバージョン更新時

1. `.devcontainer/devcontainer.json` を更新
2. コンテナをリビルド
3. `package.json` の `volta` 設定も合わせて更新

## 🚫 よくある間違い

### ❌ ローカル環境での作業

```bash
# 間違い: ローカルでnode_modulesをインストール
npm install  # ← これはしない
```

### ✅ Dev Container内での作業

```bash
# 正しい: Dev Container内で作業
pnpm install  # ← Dev Container内で実行
```

### ❌ ポート競合

```bash
# 間違い: ローカルでサーバーを起動してからDev Container起動
pnpm dev  # ← ローカルで起動
# その後Dev Containerで再度起動するとポート競合
```

### ✅ クリーンな状態でDev Container使用

```bash
# 正しい: ローカルのプロセスを全て停止してからDev Container使用
lsof -i :3000  # ポート使用確認
kill -9 <PID>  # 必要に応じてプロセス終了
```

## 🎓 学習リソース

- [Dev Containers 公式ドキュメント](https://containers.dev/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker 入門](https://docs.docker.com/get-started/)

## 💡 Tips & Best Practices

### 開発効率向上

1. **ターミナル分割**: 複数のターミナルを同時利用
   - タブ1: `pnpm dev` (開発サーバー)
   - タブ2: `pnpm test --watch` (テスト監視)
   - タブ3: 一般的なコマンド実行

2. **DevTools活用**:
   - Nuxt DevTools: 自動起動
   - TanStack Query DevTools: ブラウザ内表示
   - Vue DevTools: ブラウザ拡張機能

3. **ホットリロード**: ファイル保存時の自動更新を活用

### コード品質管理

1. **保存時自動フォーマット**: 設定済みで自動実行
2. **Git hooks**: Husky による pre-commit チェック
3. **CI/CD**: GitHub Actions での自動テスト

Dev Containerを活用して、効率的で一貫性のある開発環境での作業をお楽しみください！
