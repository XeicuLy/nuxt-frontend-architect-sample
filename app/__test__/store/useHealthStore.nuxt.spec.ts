import { setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { GetApiHealthResponse } from '#shared/types/api';
import { setupTestingPinia } from '@/helpers/test';
import { useHealthStore } from '@/store/useHealthStore';

// モック関数をホイスト
const { mockUseHealthService, mockHealthQuery } = vi.hoisted(() => ({
  mockUseHealthService: vi.fn(),
  mockHealthQuery: {
    refetch: vi.fn(),
  },
}));

// useHealthServiceをモック化
vi.mock('@/services/useHealthService', () => ({
  useHealthService: mockUseHealthService,
}));

describe('app/store/useHealthStore.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(setupTestingPinia());
    mockUseHealthService.mockReturnValue({
      healthQuery: mockHealthQuery,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    test('healthDataが空のオブジェクトで初期化されること', () => {
      const store = useHealthStore();

      expect(store.healthData).toEqual({});
    });

    test('healthStatusがundefinedであること', () => {
      const store = useHealthStore();

      expect(store.healthStatus).toBeUndefined();
    });

    test('healthTimestampがundefinedであること', () => {
      const store = useHealthStore();

      expect(store.healthTimestamp).toBeUndefined();
    });
  });

  describe('getters（計算プロパティ）の振る舞い', () => {
    test('healthDataにstatusが設定されているときhealthStatusが適切に返すこと', () => {
      const store = useHealthStore();

      // 直接stateを更新して動作確認
      store.healthData = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      } satisfies GetApiHealthResponse;

      expect(store.healthStatus).toBe('healthy');
    });

    test('healthDataにtimestampが設定されているときhealthTimestampが適切に返すこと', () => {
      const store = useHealthStore();

      // 直接stateを更新して動作確認
      store.healthData = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      } satisfies GetApiHealthResponse;

      expect(store.healthTimestamp).toBe('2024-01-01T00:00:00Z');
    });

    test('healthDataが未設定時にhealthStatusがundefinedを返すこと', () => {
      const store = useHealthStore();

      expect(store.healthStatus).toBeUndefined();
    });

    test('healthDataが未設定時にhealthTimestampがundefinedを返すこと', () => {
      const store = useHealthStore();

      expect(store.healthTimestamp).toBeUndefined();
    });
  });

  describe('getHealthDataアクション', () => {
    test('useHealthServiceを呼び出すこと', async () => {
      mockHealthQuery.refetch.mockResolvedValue({
        data: {
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00Z',
        } satisfies GetApiHealthResponse,
      });

      const store = useHealthStore();
      await store.getHealthData();

      expect(mockUseHealthService).toHaveBeenCalledTimes(1);
    });

    test('healthQuery.refetch()を呼び出すこと', async () => {
      mockHealthQuery.refetch.mockResolvedValue({
        data: {
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00Z',
        } satisfies GetApiHealthResponse,
      });

      const store = useHealthStore();
      await store.getHealthData();

      expect(mockHealthQuery.refetch).toHaveBeenCalledTimes(1);
    });

    test('API レスポンスがある場合にhealthDataを更新すること', async () => {
      const mockHealthData: GetApiHealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      };
      mockHealthQuery.refetch.mockResolvedValue({
        data: mockHealthData,
      });

      const store = useHealthStore();
      await store.getHealthData();

      expect(store.healthData).toEqual(mockHealthData);
      expect(store.healthStatus).toBe('healthy');
      expect(store.healthTimestamp).toBe('2024-01-01T00:00:00Z');
    });

    test('API レスポンスのdataがnullの場合にhealthDataを更新しないこと', async () => {
      const store = useHealthStore();

      // 初期状態を設定
      store.healthData = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      } satisfies GetApiHealthResponse;

      mockHealthQuery.refetch.mockResolvedValue({
        data: null,
      });

      await store.getHealthData();

      // 元の値が保持されること
      expect(store.healthData).toEqual({
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      });
    });

    test('API レスポンスのdataがundefinedの場合にhealthDataを更新しないこと', async () => {
      const store = useHealthStore();

      // 初期状態を設定
      store.healthData = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      } satisfies GetApiHealthResponse;

      mockHealthQuery.refetch.mockResolvedValue({
        data: undefined,
      });

      await store.getHealthData();

      // 元の値が保持されること
      expect(store.healthData).toEqual({
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      });
    });

    test('異なるhealthデータで複数回呼び出し時に最新データが反映されること', async () => {
      const store = useHealthStore();

      // 1回目の呼び出し
      const firstHealthData: GetApiHealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      };
      mockHealthQuery.refetch.mockResolvedValueOnce({
        data: firstHealthData,
      });

      await store.getHealthData();
      expect(store.healthData).toEqual(firstHealthData);

      // 2回目の呼び出し
      const secondHealthData: GetApiHealthResponse = {
        status: 'unhealthy',
        timestamp: '2024-01-02T00:00:00Z',
      };
      mockHealthQuery.refetch.mockResolvedValueOnce({
        data: secondHealthData,
      });

      await store.getHealthData();
      expect(store.healthData).toEqual(secondHealthData);
      expect(store.healthStatus).toBe('unhealthy');
      expect(store.healthTimestamp).toBe('2024-01-02T00:00:00Z');
    });

    test('API エラー時にエラーがスローされること', async () => {
      mockHealthQuery.refetch.mockRejectedValue(new Error('API Error'));

      const store = useHealthStore();

      // エラーがスローされることを確認（実装にtry-catchがないため）
      await expect(store.getHealthData()).rejects.toThrow('API Error');
    });
  });

  describe('ストア統合テスト', () => {
    test('全てのプロパティとメソッドが適切にエクスポートされること', () => {
      const store = useHealthStore();

      // state
      expect(store.healthData).toBeDefined();

      // getters - undefinedでも「定義されている」ことを確認
      expect('healthStatus' in store).toBe(true);
      expect('healthTimestamp' in store).toBe(true);

      // actions
      expect(typeof store.getHealthData).toBe('function');
    });

    test('リアクティブな状態管理が機能すること', async () => {
      const mockHealthData: GetApiHealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      };
      mockHealthQuery.refetch.mockResolvedValue({
        data: mockHealthData,
      });

      const store = useHealthStore();

      // 初期状態の確認
      expect(store.healthStatus).toBeUndefined();
      expect(store.healthTimestamp).toBeUndefined();

      // データ取得後の状態確認
      await store.getHealthData();
      expect(store.healthStatus).toBe('healthy');
      expect(store.healthTimestamp).toBe('2024-01-01T00:00:00Z');
    });
  });
});
