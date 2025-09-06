import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { GetApiHealthResponse } from '#shared/types/api';
import { useHealthService } from '@/services/useHealthService';

// モック関数をホイスト
const { mockFetch, mockUseQuery } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockUseQuery: vi.fn(),
}));

// vue-queryのモック
vi.mock('@tanstack/vue-query', () => ({
  useQuery: mockUseQuery,
}));

describe('useHealthService', () => {
  beforeEach(() => {
    // $fetchをグローバルスタブでモック（グローバル汚染回避）
    vi.stubGlobal('$fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // グローバルスタブをクリーンアップ
    vi.unstubAllGlobals();
  });

  test('ヘルスサービスとして必要な機能を提供すること', () => {
    const result = useHealthService();

    // ヘルスサービスとして必要な機能が提供されることを確認
    expect(result).toHaveProperty('getHealthApi');
    expect(result).toHaveProperty('healthQuery');
    expect(typeof result.getHealthApi).toBe('function');
  });

  test('ヘルスAPIからデータを正常に取得できること', async () => {
    const mockHealthData: GetApiHealthResponse = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
    };
    mockFetch.mockResolvedValue(mockHealthData);
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    const { getHealthApi } = useHealthService();
    const result = await getHealthApi();

    // ヘルスデータが期待通りに取得できることを確認
    expect(result).toEqual(mockHealthData);
    expect(mockFetch).toHaveBeenCalledWith('/api/health', { method: 'GET' });
  });

  test('APIエラー時にエラー状態を適切に処理すること', async () => {
    const apiError = new Error('ヘルスチェックが失敗しました');
    mockFetch.mockRejectedValue(apiError);
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    const { getHealthApi } = useHealthService();

    // エラー時の適切な処理を確認
    await expect(getHealthApi()).rejects.toThrow('ヘルスチェックが失敗しました');
  });

  test('ヘルスクエリが提供されること', () => {
    const mockHealthQueryResult = {
      data: { value: { status: 'healthy', timestamp: '2024-01-01T00:00:00Z' } },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    };
    mockUseQuery.mockReturnValue(mockHealthQueryResult);

    const { healthQuery } = useHealthService();

    // ヘルスクエリが期待されるデータを提供することを確認
    expect(healthQuery.data.value).toEqual({
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
    });
    expect(healthQuery.isLoading.value).toBe(false);
    expect(healthQuery.error.value).toBe(null);
    expect(typeof healthQuery.refetch).toBe('function');
  });

  test('複数回の呼び出しで一貫した動作をすること', () => {
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    // 複数回呼び出しても正常に動作することを確認
    const service1 = useHealthService();
    const service2 = useHealthService();

    expect(service1.getHealthApi).toBeDefined();
    expect(service1.healthQuery).toBeDefined();
    expect(service2.getHealthApi).toBeDefined();
    expect(service2.healthQuery).toBeDefined();
  });
});
