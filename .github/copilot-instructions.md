# GitHub Copilot インストラクション

Nuxt.js + Vue.js + TypeScript を使用したフルスタック Web アプリケーション

## 📚 詳細ドキュメント

プロジェクトの詳細情報は以下を参照：

- **[README.md](../README.md)**: プロジェクト概要、技術スタック、使用方法
- **[.serena/memories/code_style_conventions.md](../.serena/memories/code_style_conventions.md)**: コードスタイル詳細
- **[.serena/memories/architecture_patterns.md](../.serena/memories/architecture_patterns.md)**: アーキテクチャパターン

## 🎯 実装時の重要な規約

### コード品質

- **インデント**: 2スペース、**行幅**: 120文字、**クォート**: シングル
- リント: `pnpm lint` でESLint + Biome + TailwindCSSチェック
- 型チェック: `pnpm typecheck` で検証必須

### 命名規約

- **Vueコンポーネント**: PascalCase (`HealthStatusDisplayArea.vue`)
- **コンポーザブル**: `use` + camelCase (`useHealth.ts`)
- **API関数**: camelCase + `Api` (`getHealthApi`)
- **テスト**: `*.spec.ts` または `*.nuxt.spec.ts`

### アーキテクチャ

**4層レイヤード構成**:
1. Services (`app/services/`) → API通信 + Zodバリデーション
2. Queries (`app/queries/`) → TanStack Query でキャッシング
3. Composables (`app/composables/`) → ビジネスロジック + データ変換
4. Components → 表示

### テストパターン

- `describe` は日本語でファイル名記述
- テスト名も日本語
- `data-testid` でDOM要素特定
- `mountComponent` ヘルパー使用

## コミットメッセージ規約

### 基本構造

`<gitmoji> <type>: <message> (<#issue number>)`

### 例

- ✨ feat: xx 機能を追加
- 🐛 fix: ユーザー登録時のバグを修正
- 🔧 chore: CI の設定を変更
- 📝 docs: コミットメッセージ規約を追加 (#52)

### タイプの一覧

[gitmoji.dev](https://gitmoji.dev/)

- ✨ : 新機能の導入
- 🐛 : バグの修正
- 🚑 : 重大なホットフィックス
- 🔧 : 設定ファイルの追加/更新
- 📝 : ドキュメンテーションの追加/更新
- 🩹 : 軽微な修正
- 🦺 : バリデーションの追加・更新
- ♻️ : コードのリファクタリング
- ⚡️ : パフォーマンス改善
- 👷 : CIビルドシステムの追加/更新
- ✅ : テストの追加/更新/合格
- 🔥 : 不要なコードやファイルの削除
- 🚨 : linterの警告の修正
- 🎨 : コードの構造/形式の改善
- ♿️ : アクセシビリティの改善
- 🏷️ : タグの追加/更新

など

### 注意点

- コミットメッセージは日本語で記述すること
- メッセージは簡潔に、何をしたのかを明確にすること
- 同じ type でも絵文字で粒度を表現してよい（例: 🩹 update: 軽微な修正 / 🦺 update: バリデーションの追加・更新）
- `: ` の後は半角スペースを入れる（例: `feat: 新機能を追加`）
- Issue 番号の前は半角スペースを入れる（例: `... 追加 (#123)`）
- 関連するIssue番号がある場合は必ず記載する（例: `(#123)`）
- Issue番号がない場合は括弧ごと省略する
- 件名末尾に句点（。/.）は付けない
