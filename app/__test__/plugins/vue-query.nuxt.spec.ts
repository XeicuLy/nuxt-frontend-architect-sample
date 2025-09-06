import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { DehydratedState } from '@tanstack/vue-query';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// モック関数をホイスト
const {
  mockQueryClient,
  mockQueryClientConstructor,
  mockVueQueryPlugin,
  mockDehydrate,
  mockHydrate,
  mockUseRuntime,
  mockDefineNuxtPlugin,
  mockUseState,
} = vi.hoisted(() => ({
  mockQueryClient: { setDefaultOptions: vi.fn() },
  mockQueryClientConstructor: vi.fn(),
  mockVueQueryPlugin: { install: vi.fn() },
  mockDehydrate: vi.fn(),
  mockHydrate: vi.fn(),
  mockUseRuntime: vi.fn(),
  mockDefineNuxtPlugin: vi.fn(),
  mockUseState: vi.fn(),
}));

// QueryClientConstructorの戻り値を設定
mockQueryClientConstructor.mockReturnValue(mockQueryClient);
mockDehydrate.mockReturnValue({ queries: [], mutations: [] } as DehydratedState);

vi.mock('@tanstack/vue-query', () => ({
  QueryClient: mockQueryClientConstructor,
  VueQueryPlugin: mockVueQueryPlugin,
  dehydrate: mockDehydrate,
  hydrate: mockHydrate,
}));

vi.mock('@/composables/common/useRuntime', () => ({
  useRuntime: mockUseRuntime,
}));

mockNuxtImport('defineNuxtPlugin', () => mockDefineNuxtPlugin);
mockNuxtImport('useState', () => mockUseState);

interface MockVueApp {
  use: ReturnType<typeof vi.fn>;
}

interface MockNuxtApp {
  vueApp: MockVueApp;
  hooks: {
    hook: ReturnType<typeof vi.fn>;
  };
}

describe('app/plugins/vue-query.ts', () => {
  let mockNuxtApp: MockNuxtApp;
  let mockVueApp: MockVueApp;
  let pluginFunction: (nuxtApp: MockNuxtApp) => void;

  beforeEach(() => {
    mockVueApp = { use: vi.fn() };
    mockNuxtApp = {
      vueApp: mockVueApp,
      hooks: { hook: vi.fn() },
    };

    mockUseRuntime.mockReturnValue({
      isProcessServer: { value: false },
      isProcessClient: { value: false },
    });

    const mockVueQueryState = { value: null };
    mockUseState.mockReturnValue(mockVueQueryState);

    // プラグインをインポートしてdefineNuxtPluginに渡された関数を取得
    vi.doMock('@/plugins/vue-query', async () => {
      const module = await vi.importActual('@/plugins/vue-query');
      return module;
    });

    // defineNuxtPluginが呼ばれたときの関数を記録
    mockDefineNuxtPlugin.mockImplementation((fn: (nuxtApp: MockNuxtApp) => void) => {
      pluginFunction = fn;
      return fn;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('プラグインが適切な設定でQueryClientを初期化すること', async () => {
    await import('@/plugins/vue-query');

    expect(mockDefineNuxtPlugin).toHaveBeenCalledWith(expect.any(Function));

    // プラグイン関数を実行
    pluginFunction(mockNuxtApp);

    // QueryClientが正しいオプションで作成されること
    expect(mockQueryClientConstructor).toHaveBeenCalledWith({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5分間キャッシュ
          gcTime: 1000 * 60 * 30, // 30分間メモリに保持
          refetchOnWindowFocus: false,
          refetchOnMount: true,
          retry: 1,
        },
      },
    });
  });

  test('プラグインがVueQueryPluginをVueアプリに適用すること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    // VueQueryPluginがVueアプリに適用されること
    expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
      queryClient: mockQueryClient,
    });
  });

  test('useRuntimeコンポーザブルが呼び出されること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    expect(mockUseRuntime).toHaveBeenCalled();
  });

  test('vue-queryという名前でuseStateが呼び出されること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    expect(mockUseState).toHaveBeenCalledWith('vue-query');
  });

  describe('サーバーサイドの振る舞い', () => {
    test('isProcessServerがtrueの場合、app:renderedフックが登録されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: false },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:rendered', expect.any(Function));
    });

    test('app:renderedフックでdehydrateが実行され、vueQueryStateに設定されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: false },
      });

      const mockVueQueryState = { value: null };
      mockUseState.mockReturnValue(mockVueQueryState);

      const mockDehydratedState: DehydratedState = { queries: [], mutations: [] };
      mockDehydrate.mockReturnValue(mockDehydratedState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // app:renderedフックに登録された関数を取得して実行
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:rendered')?.[1];
      expect(hookCallback).toBeDefined();

      hookCallback();

      expect(mockDehydrate).toHaveBeenCalledWith(mockQueryClient);
      expect(mockVueQueryState.value).toBe(mockDehydratedState);
    });

    test('isProcessServerがfalseの場合、app:renderedフックが登録されないこと', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      const appRenderedCalls = mockNuxtApp.hooks.hook.mock.calls.filter((call) => call[0] === 'app:rendered');
      expect(appRenderedCalls).toHaveLength(0);
    });
  });

  describe('クライアントサイドの振る舞い', () => {
    test('isProcessClientがtrueの場合、app:createdフックが登録されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:created', expect.any(Function));
    });

    test('app:createdフックでhydrateが実行されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      const mockVueQueryState = { value: { queries: [], mutations: [] } as DehydratedState };
      mockUseState.mockReturnValue(mockVueQueryState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // app:createdフックに登録された関数を取得して実行
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:created')?.[1];
      expect(hookCallback).toBeDefined();

      hookCallback();

      expect(mockHydrate).toHaveBeenCalledWith(mockQueryClient, mockVueQueryState.value);
    });

    test('isProcessClientがfalseの場合、app:createdフックが登録されないこと', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: false },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      const appCreatedCalls = mockNuxtApp.hooks.hook.mock.calls.filter((call) => call[0] === 'app:created');
      expect(appCreatedCalls).toHaveLength(0);
    });
  });

  describe('ランタイム環境による分岐処理', () => {
    test('サーバーとクライアントの両方がtrueの場合、両方のフックが登録されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: true },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:rendered', expect.any(Function));
      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:created', expect.any(Function));
    });

    test('サーバーとクライアントの両方がfalseの場合、フックが登録されないこと', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: false },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).not.toHaveBeenCalled();
    });
  });

  describe('プラグインの統合動作', () => {
    test('サーバーサイドでの完全な動作フロー', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: false },
      });

      const mockVueQueryState = { value: null };
      mockUseState.mockReturnValue(mockVueQueryState);

      const mockDehydratedState: DehydratedState = { queries: [], mutations: [] };
      mockDehydrate.mockReturnValue(mockDehydratedState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // 基本的な初期化が完了していること
      expect(mockQueryClientConstructor).toHaveBeenCalled();
      expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
        queryClient: mockQueryClient,
      });

      // app:renderedフックの実行
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:rendered')?.[1];
      hookCallback();

      // dehydrateが実行され、状態が保存されること
      expect(mockDehydrate).toHaveBeenCalledWith(mockQueryClient);
      expect(mockVueQueryState.value).toBe(mockDehydratedState);
    });

    test('クライアントサイドでの完全な動作フロー', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      const existingState: DehydratedState = { queries: [], mutations: [] };
      const mockVueQueryState = { value: existingState };
      mockUseState.mockReturnValue(mockVueQueryState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // 基本的な初期化が完了していること
      expect(mockQueryClientConstructor).toHaveBeenCalled();
      expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
        queryClient: mockQueryClient,
      });

      // app:createdフックの実行
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:created')?.[1];
      hookCallback();

      // hydrateが実行されること
      expect(mockHydrate).toHaveBeenCalledWith(mockQueryClient, existingState);
    });
  });
});
