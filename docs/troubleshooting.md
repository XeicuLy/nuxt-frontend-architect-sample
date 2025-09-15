# 🔧 トラブルシューティングガイド

よくある問題とその解決方法について説明します。

## 開発サーバー関連

### 開発サーバーが起動しない

#### 問題1: ポートが既に使用されている

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法:**

```bash
# 別のポートで起動
pnpm dev --port 3001

# または使用中のポートを強制終了
lsof -ti:3000 | xargs kill -9
```

#### 問題2: Node.js/pnpmのバージョン不一致

```bash
Error: This project requires Node.js version >=22.16.0
```

**解決方法:**

```bash
# Voltaを使用している場合
volta install node@22.16.0
volta install pnpm@10.15.1

# nvm使用の場合
nvm install 22.16.0
nvm use 22.16.0
npm install -g pnpm@10.15.1
```

#### 問題3: 依存関係のインストールエラー

```bash
# node_modulesを完全に削除して再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install

# キャッシュも削除する場合
pnpm store prune
```

### ホットリロードが動作しない

**解決方法:**

1. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
2. 開発サーバーを再起動
3. Nuxtキャッシュを削除：`rm -rf .nuxt`

## 型定義関連

### 型定義が生成されない

#### 問題: OpenAPIエンドポイントにアクセスできない

**診断:**

```bash
curl http://localhost:3000/api/openapi.yaml
```

**解決方法:**

```bash
# 開発サーバーを起動してから型定義生成
pnpm dev
# 別ターミナルで
pnpm generate-types
```

### 型エラーが発生する

#### 問題1: 生成された型が古い

```typescript
// エラー例
Property 'newField' does not exist on type 'GetApiHealthResponse'
```

**解決方法:**

```bash
# 型定義を再生成
pnpm generate-types

# TypeScript型チェック実行
pnpm typecheck
```

#### 問題2: Zodスキーマと型定義の不整合

**解決方法:**

```typescript
// server/api/schema/ のスキーマを確認・修正
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  newField: z.string(), // 新しいフィールドを追加
});
```

## TanStack Query 関連

### データが取得できない

#### 問題1: APIエンドポイントのエラー

**診断:**

```typescript
// ブラウザ開発者ツールのネットワークタブを確認
// コンソールでAPIを直接テスト
fetch('/api/health')
  .then((r) => r.json())
  .then(console.log);
```

**解決方法:**

```typescript
// サービス層にログ追加
export const getHealthApi = async () => {
  console.log('API Request: /api/health');
  try {
    const response = await $fetch('/api/health');
    console.log('API Response:', response);
    return zGetApiHealthResponse.parse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

#### 問題2: クエリが実行されない

```typescript
// クエリが無効化されている場合の確認
const { healthQuery } = useHealthQuery();
console.log('Query enabled:', healthQuery.enabled);
console.log('Query status:', healthQuery.status);
```

### キャッシュの問題

#### キャッシュが効きすぎる

```typescript
// 強制的にデータを再取得
const { healthQuery } = useHealthQuery();
healthQuery.refetch();

// または queryClient で無効化
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['health'] });
```

## Pinia 関連

### ストア状態が更新されない

#### 問題1: リアクティビティの問題

```typescript
// ❌ 間違った使い方
const store = useHealthStore();
const input = store.input; // リアクティビティが失われる

// ✅ 正しい使い方
const store = useHealthStore();
const { input } = storeToRefs(store);
```

#### 問題2: ストアが初期化されない

**解決方法:**

```typescript
// app.vue で Pinia プラグインが正しく読み込まれているか確認
// nuxt.config.ts で @pinia/nuxt が設定されているか確認
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
});
```

## リンター・フォーマッター関連

### ESLint/Prettier エラー

#### 自動修正で解決

```bash
# 全自動修正を実行
pnpm lint:fix

# 個別に修正
pnpm eslint:fix    # ESLint
pnpm biome:fix     # Biome
pnpm prettier:fix  # Prettier
```

#### 設定の競合

**解決方法:**

```json
// .vscode/settings.json で優先度を設定
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports.biome": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### Biome設定の問題

```bash
# Biome設定をチェック
pnpm biome check --verbose

# 設定ファイルを検証
pnpm biome check --config-path biome.json
```

## ビルド関連

### プロダクションビルドエラー

#### 問題1: 未使用のimport

```typescript
// ビルド時にエラーになる未使用import
import { unusedFunction } from './utils'; // 削除が必要
```

#### 問題2: 環境変数の設定不足

```bash
# .env ファイルを確認
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 本番環境用の設定
NUXT_PUBLIC_API_BASE_URL=https://your-production-api.com
```

### 静的生成（SSG）の問題

```typescript
// nuxt.config.ts でニトロの設定確認
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false, // 必要に応じて調整
    },
  },
});
```

## SSR/Hydration 関連

### ハイドレーションエラー

#### 問題: サーバーとクライアントの不整合

```bash
[Vue warn]: Hydration node mismatch
```

**解決方法:**

```vue
<!-- ClientOnly でクライアント側のみ描画 -->
<template>
  <div>
    <ClientOnly>
      <DynamicComponent />
      <template #fallback>
        <div>Loading...</div>
      </template>
    </ClientOnly>
  </div>
</template>
```

#### TanStack Query のSSR問題

```typescript
// app/plugins/vue-query.ts でSSR設定確認
export default defineNuxtPlugin(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        // SSR設定
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  const vueQueryState = useState<DehydratedState | null>('vue-query');

  // ハイドレーション
  if (process.client && vueQueryState.value) {
    hydrate(queryClient, vueQueryState.value);
  }
});
```

## API 関連

### CORS エラー

```bash
Access to fetch at 'http://localhost:3000/api/health' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

**解決方法:**

```typescript
// server/api/routes/health.ts でCORS設定
import { cors } from 'hono/cors';

const app = new OpenAPIHono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  }),
);
```

### API レスポンスの検証エラー

```typescript
// Zodエラーの詳細表示
try {
  return zGetApiHealthResponse.parse(response);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.issues);
    console.error('Received data:', response);
  }
  throw error;
}
```

## テスト関連

### テストが失敗する

#### 問題1: 非同期処理の待機不足

```typescript
// ❌ 待機不足
it('should display data', () => {
  const wrapper = mount(Component);
  expect(wrapper.text()).toContain('data'); // 失敗する可能性
});

// ✅ 適切な待機
it('should display data', async () => {
  const wrapper = mount(Component);
  await wrapper.vm.$nextTick();
  await flushPromises(); // Promise の完了を待つ
  expect(wrapper.text()).toContain('data');
});
```

#### 問題2: モックの設定ミス

```typescript
// モックがリセットされているか確認
beforeEach(() => {
  vi.clearAllMocks();
});

// モックの呼び出しを確認
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

## パフォーマンス関連

### ページの表示が遅い

#### 診断方法

```typescript
// パフォーマンス測定
console.time('component-render');
// ... コンポーネント処理
console.timeEnd('component-render');

// TanStack Query DevTools でキャッシュ状況確認
// Chrome DevTools の Performance タブで分析
```

#### 最適化方法

```typescript
// 重いコンポーネントの遅延読み込み
const HeavyComponent = defineAsyncComponent(() => import('~/components/HeavyComponent.vue'));

// 不要な再レンダリングを防ぐ
const memoizedValue = computed(() => {
  return expensiveCalculation(props.data);
});
```

## デバッグのベストプラクティス

### 1. ログの活用

```typescript
// 環境別ログ出力
const debug = process.env.NODE_ENV === 'development';

if (debug) {
  console.log('State:', state);
  console.log('Props:', props);
}
```

### 2. Vue DevTools の活用

- コンポーネントの階層構造確認
- リアクティブデータの監視
- Piniaストアの状態確認
- TanStack Query の状態確認

### 3. ブラウザ開発者ツール

```javascript
// コンソールで状態確認
$nuxt.$pinia.state.value; // Piniaストア状態
$nuxt.$router.currentRoute.value; // ルート情報
```

## ヘルプとサポート

### 情報収集の方法

1. **エラーメッセージの詳細確認**
   - ブラウザのコンソール
   - ターミナルの出力
   - ネットワークタブのエラー

2. **公式ドキュメント参照**
   - [Nuxt 3 Documentation](https://nuxt.com/docs)
   - [TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
   - [Pinia Documentation](https://pinia.vuejs.org/)

3. **Issue 報告**
   - 再現手順の明記
   - 環境情報の提供
   - エラーログの添付

## 緊急時の対処法

### 開発環境のリセット

```bash
# すべてをリセット
rm -rf node_modules pnpm-lock.yaml .nuxt
pnpm install
pnpm dev
```

### ロールバック

```bash
# 最後に動作していたコミットに戻す
git log --oneline -10
git reset --hard <commit-hash>
```

## 次のステップ

問題が解決しない場合は：

- 🚀 [デプロイメントガイド](./deployment.md) で本番環境の設定を確認
- 💻 [開発ワークフロー](./development.md) で推奨手順を再確認
- 📖 [アーキテクチャガイド](./architecture.md) で設計原則を確認
