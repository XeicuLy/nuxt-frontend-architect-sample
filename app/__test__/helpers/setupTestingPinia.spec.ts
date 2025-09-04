import { defineStore } from 'pinia';
import { describe, expect, test } from 'vitest';
import { setupTestingPinia } from '@/helpers/test';

// テスト用の定数
const TEST_STORE_VALUES = {
  DEFAULT: {
    COUNT: 0,
    NAME: 'test',
  },
  CUSTOM: {
    INITIAL_COUNT: 5,
    INITIAL_NAME: 'initialName',
    COUNT_10: 10,
    CUSTOM_NAME: 'customName',
    NEW_NAME: 'newName',
    UPDATED_NAME: 'updatedName',
  },
} as const;

const useTestStore = defineStore('test', {
  state: (): { count: number; name: string } => ({
    count: TEST_STORE_VALUES.DEFAULT.COUNT,
    name: TEST_STORE_VALUES.DEFAULT.NAME,
  }),
  actions: {
    increment() {
      this.count++;
    },
    updateName(name: string) {
      this.name = name;
    },
  },
});

describe('src/helpers/test/setupTestingPinia.ts', () => {
  describe('ストアの初期化', () => {
    test('デフォルト状態で機能的なストアインスタンスを提供する', () => {
      const pinia = setupTestingPinia();
      const store = useTestStore(pinia);

      // 初期状態の確認
      expect(store.count).toBe(TEST_STORE_VALUES.DEFAULT.COUNT);
      expect(store.name).toBe(TEST_STORE_VALUES.DEFAULT.NAME);
    });

    test('アクションによるストア状態の変更をサポートする', () => {
      const pinia = setupTestingPinia();
      const store = useTestStore(pinia);

      const initialCount = store.count;

      // アクションの実行
      store.increment();
      store.updateName(TEST_STORE_VALUES.CUSTOM.NEW_NAME);

      // 状態変更の確認
      expect(store.count).toBe(initialCount + 1);
      expect(store.name).toBe(TEST_STORE_VALUES.CUSTOM.NEW_NAME);
    });
  });

  describe('カスタム初期状態', () => {
    test('カスタム初期状態を受け入れて適用する', () => {
      const customState = {
        test: {
          count: TEST_STORE_VALUES.CUSTOM.INITIAL_COUNT,
          name: TEST_STORE_VALUES.CUSTOM.INITIAL_NAME,
        },
      };

      const pinia = setupTestingPinia(customState);
      const store = useTestStore(pinia);

      // カスタム状態の適用確認
      expect(store.count).toBe(TEST_STORE_VALUES.CUSTOM.INITIAL_COUNT);
      expect(store.name).toBe(TEST_STORE_VALUES.CUSTOM.INITIAL_NAME);
    });

    test('カスタム状態でもアクション機能を維持する', () => {
      const customState = {
        test: {
          count: TEST_STORE_VALUES.CUSTOM.COUNT_10,
          name: TEST_STORE_VALUES.CUSTOM.CUSTOM_NAME,
        },
      };

      const pinia = setupTestingPinia(customState);
      const store = useTestStore(pinia);

      const initialCount = store.count;

      // カスタム状態でのアクション実行
      store.increment();
      store.updateName(TEST_STORE_VALUES.CUSTOM.UPDATED_NAME);

      // アクションの動作確認
      expect(store.count).toBe(initialCount + 1);
      expect(store.name).toBe(TEST_STORE_VALUES.CUSTOM.UPDATED_NAME);
    });
  });

  describe('テスト環境の互換性', () => {
    test('独立したテスト機能を提供する', () => {
      const pinia1 = setupTestingPinia();
      const pinia2 = setupTestingPinia();

      // 異なるPiniaインスタンスが独立していることを確認
      expect(pinia1).not.toBe(pinia2);
      expect(pinia1).toBeDefined();
      expect(pinia2).toBeDefined();
      expect(typeof pinia1).toBe('object');
      expect(typeof pinia2).toBe('object');

      // 各ストアインスタンスの機能確認
      const store1 = useTestStore(pinia1);
      const store2 = useTestStore(pinia2);

      expect(store1).toBeDefined();
      expect(store2).toBeDefined();

      // ストア1の型確認
      expect(typeof store1.count).toBe('number');
      expect(typeof store1.name).toBe('string');
      expect(typeof store1.increment).toBe('function');
      expect(typeof store1.updateName).toBe('function');

      // ストア2の型確認
      expect(typeof store2.count).toBe('number');
      expect(typeof store2.name).toBe('string');
      expect(typeof store2.increment).toBe('function');
      expect(typeof store2.updateName).toBe('function');
    });

    test('コンポーネントテスト用の有効なPiniaインスタンスを作成する', () => {
      const pinia = setupTestingPinia();

      // Piniaインスタンスの有効性確認
      expect(pinia).toBeDefined();
      expect(typeof pinia).toBe('object');

      // ストアインスタンスの機能確認
      const store = useTestStore(pinia);
      expect(store).toBeDefined();
      expect(typeof store.count).toBe('number');
      expect(typeof store.name).toBe('string');
    });
  });
});
