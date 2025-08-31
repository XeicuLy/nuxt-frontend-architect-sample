import { createTestingPinia } from '@pinia/testing';
import type { StateTree } from 'pinia';
import { vi } from 'vitest';

/**
 * テスト用のPiniaインスタンスを作成するヘルパー関数
 *
 * @param initialState - Piniaストアに設定する初期状態（デフォルトは空オブジェクト）
 * @returns テスト用Piniaインスタンス
 */
export const setupTestingPinia = (initialState: StateTree = {}) => {
  const testingPinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    initialState,
  });
  return testingPinia;
};
