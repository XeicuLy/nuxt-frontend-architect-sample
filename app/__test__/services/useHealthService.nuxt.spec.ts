import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { GetApiHealthResponse } from '#shared/types/api';
import { useHealthService } from '@/services/useHealthService';

// モック関数をホイスト
const { mockFetch, mockUseQuery } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockUseQuery: vi.fn(),
}));

// $fetchのモック（グローバル関数として設定）
globalThis.$fetch = mockFetch as unknown as typeof $fetch;

// vue-queryのモック
vi.mock('@tanstack/vue-query', () => ({
  useQuery: mockUseQuery,
}));

describe('useHealthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('useHealthServiceが期待されるインターフェースを返すこと', () => {
    // モックQuery結果を設定
    const mockQueryResult = {
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    };
    mockUseQuery.mockReturnValue(mockQueryResult);

    const result = useHealthService();

    // 基本的なインターフェースの確認
    expect(result).toHaveProperty('getHealthApi');
    expect(result).toHaveProperty('healthQuery');
    expect(typeof result.getHealthApi).toBe('function');
  });

  test('getHealthApi関数が正しくAPIを呼び出すこと', async () => {
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

    // API呼び出しが正しい形式で行われたことを確認
    expect(mockFetch).toHaveBeenCalledWith('/api/health', {
      method: 'GET',
    });
    // 結果が期待通りであることを確認
    expect(result).toEqual(mockHealthData);
  });

  test('APIエラー時に適切にエラーをスローすること', async () => {
    const apiError = new Error('API Error');
    mockFetch.mockRejectedValue(apiError);
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    const { getHealthApi } = useHealthService();

    await expect(getHealthApi()).rejects.toThrow('API Error');
  });

  test('useQueryが正しいパラメータで呼び出されること', () => {
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    const { getHealthApi } = useHealthService();

    // useQueryが正しいパラメータで呼ばれることを確認
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['health'],
      queryFn: getHealthApi,
    });
  });

  test('クエリキーが一貫していること（リグレッション防止）', () => {
    mockUseQuery.mockReturnValue({
      data: { value: undefined },
      isLoading: { value: false },
      error: { value: null },
      refetch: vi.fn(),
    });

    // 複数回呼び出し
    useHealthService();
    useHealthService();

    // 同じクエリキーで呼び出されることを確認
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['health'],
      queryFn: expect.any(Function),
    });
    expect(mockUseQuery).toHaveBeenCalledTimes(2);
  });
});
