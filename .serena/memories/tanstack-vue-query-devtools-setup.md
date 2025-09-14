# TanStack Vue Query DevTools 設定

## 問題

- `setupDevtoolsPlugin` エラー: `@vue/devtools-api`からのインポートエラー
- SSRアプリケーション（Nuxt）でのDevTools実装

## 解決方法

### Traditional DevToolsアプローチ

- `@tanstack/vue-query-devtools` パッケージは**不要**
- プラグインオプションで `enableDevtoolsV6Plugin: true` を設定
- Vue DevToolsブラウザ拡張機能との統合を有効化

### 実装例（app/plugins/vue-query.ts）

```typescript
const options: VueQueryPluginOptions = {
  queryClient,
  enableDevtoolsV6Plugin: true, // Traditional DevTools
};

nuxtApp.vueApp.use(VueQueryPlugin, options);
```

## 重要なポイント

1. **Component式DevTools**: `<VueQueryDevtools />` - 独立型パッケージが必要
2. **Traditional DevTools**: `enableDevtoolsV6Plugin: true` - パッケージ不要、ブラウザ拡張機能使用
3. **SSR対応**: Traditional DevToolsはSSRで問題なし
4. **Production**: デフォルトでproductionビルドから除外

## トラブルシューティング

- `setupDevtoolsPlugin` エラー → `@tanstack/vue-query-devtools` パッケージを削除
- SSRハイドレーションエラー → Traditional DevToolsに切り替え
