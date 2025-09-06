import { afterEach, describe, expect, test, vi } from 'vitest';
import { useHealth } from '@/composables/useHealth';

// モック関数をホイスト
const { mockUseHealthAdapter } = vi.hoisted(() => ({
  mockUseHealthAdapter: vi.fn(),
}));

// useHealthAdapterをモック化
vi.mock('@/composables/useHealth/useHealthAdapter', () => ({
  useHealthAdapter: mockUseHealthAdapter,
}));

describe('app/composables/useHealth/index.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('アダプター統合の振る舞い', () => {
    test('useHealthAdapterが適切に呼び出されること', () => {
      const mockAdapterResult = {
        healthStatus: { value: undefined },
        healthTimestamp: { value: undefined },
        getHealthData: vi.fn(),
      };
      mockUseHealthAdapter.mockReturnValue(mockAdapterResult);

      useHealth();

      // useHealthAdapterが呼び出されることを確認
      expect(mockUseHealthAdapter).toHaveBeenCalledTimes(1);
    });
  });
});
