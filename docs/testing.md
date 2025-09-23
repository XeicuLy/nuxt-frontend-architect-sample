# 🧪 テスト入門ガイド

初学者向けに、このサンプルプロジェクトでテストを始める方法を説明します。

## このプロジェクトのテスト準備状況

### ✅ 準備済みの機能

- **Vitest**: テストフレームワーク
- **@pinia/testing**: Piniaストアのテスト支援
- **setupTestingPinia**: テスト用ヘルパー関数

### 📚 学習できるテストの基本

1. **Piniaストア（クライアント状態）のテスト**
2. **TanStack Query（サーバー状態）の基本的なテスト考え方**
3. **テスト環境の準備方法**

## 基本的なテストの考え方

### Piniaストアのテスト

プロジェクトには `app/helpers/test/setupTestingPinia.ts` が準備されています：

```typescript
// app/helpers/test/setupTestingPinia.ts（実際のファイル）
import { createTestingPinia, type TestingPinia } from '@pinia/testing';
import type { StateTree } from 'pinia';
import { vi } from 'vitest';

export const setupTestingPinia = (initialState: StateTree = {}): TestingPinia => {
  const testingPinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    initialState,
  });
  return testingPinia;
};
```

### 基本的なテストの書き方例

```typescript
// tests/store/health.test.ts（例）
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHealthStore } from '~/store/health';

describe('Health Store', () => {
  beforeEach(() => {
    // 各テストで新しいPiniaインスタンスを作成
    setActivePinia(createPinia());
  });

  it('初期状態が正しく設定される', () => {
    const store = useHealthStore();
    expect(store.input).toBe('');
  });

  it('input値を更新できる', () => {
    const store = useHealthStore();
    store.updateInput('test input');
    expect(store.input).toBe('test input');
  });
});
```

### テストヘルパーを使った例

```typescript
// setupTestingPiniaを使用した例
import { describe, it, expect } from 'vitest';
import { setupTestingPinia } from '~/helpers/test/setupTestingPinia';
import { useHealthStore } from '~/store/health';

describe('Health Store (with helper)', () => {
  it('初期状態を設定してテストできる', () => {
    // 初期状態を設定
    setupTestingPinia({
      health: { input: 'initial value' },
    });

    const store = useHealthStore();
    expect(store.input).toBe('initial value');
  });
});
```

## テスト実行方法

### 基本コマンド

```bash
# テスト実行
pnpm test

# テストをウォッチモードで実行（ファイル変更時に自動実行）
pnpm test --watch

# カバレッジ付きでテスト実行
pnpm test:coverage

# UIモードでテスト実行
pnpm test:ui
```

## テストファイルの作成場所

プロジェクトの推奨構造：

```
tests/
├── store/          # Piniaストアのテスト
├── composables/    # Composableのテスト
├── services/       # API通信のテスト
└── components/     # コンポーネントのテスト
```

## テスト学習のステップ

### 🔰 Step 1: Piniaストアのテスト

まずは一番シンプルなPiniaストアのテストから始めましょう。

### ⚡ Step 2: Composableのテスト

状態管理ロジックをテストしてみましょう。

### 🎯 Step 3: API通信のテスト

モックを使った基本的なAPIテストを学びましょう。

## 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Pinia Testing公式ドキュメント](https://pinia.vuejs.org/cookbook/testing.html)
- [Vue Test Utils](https://test-utils.vuejs.org/)

## 次のステップ

- 💻 [開発ワークフロー](./development.md) - 開発とテストの組み合わせ方
- 🔧 [トラブルシューティング](./troubleshooting.md) - テストでよくある問題
- 🚀 [デプロイメント](./deployment.md) - テスト通過後のデプロイ
