import { afterEach, describe, expect, test, vi } from 'vitest';
import { useHealthAdapter } from '@/composables/useHealth/useHealthAdapter';

// モック関数をホイスト
const { mockUseHealthStore } = vi.hoisted(() => ({
  mockUseHealthStore: vi.fn(),
}));

// useHealthStoreをモック化
vi.mock('@/store/useHealthStore', () => ({
  useHealthStore: mockUseHealthStore,
}));

describe('app/composables/useHealth/useHealthAdapter.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ストア統合の振る舞い', () => {
    test('useHealthStoreが適切に呼び出されること', () => {
      const mockStoreResult = {
        healthStatus: { value: undefined },
        healthTimestamp: { value: undefined },
        getHealthData: vi.fn(),
      };
      mockUseHealthStore.mockReturnValue(mockStoreResult);

      useHealthAdapter();

      // useHealthStoreが呼び出されることを確認
      expect(mockUseHealthStore).toHaveBeenCalledTimes(1);
    });

    test('useHealthStoreの結果をそのまま返すこと', () => {
      const mockStoreResult = {
        healthStatus: { value: 'healthy' },
        healthTimestamp: { value: '2024-01-01T00:00:00Z' },
        getHealthData: vi.fn(),
      };
      mockUseHealthStore.mockReturnValue(mockStoreResult);

      const result = useHealthAdapter();

      // ストアの結果がそのまま返されることを確認
      expect(result).toEqual(mockStoreResult);
    });
  });
});
