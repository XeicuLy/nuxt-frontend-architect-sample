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

  test('Vue Queryプラグインが正常に初期化されること', async () => {
    await import('@/plugins/vue-query');

    expect(mockDefineNuxtPlugin).toHaveBeenCalledWith(expect.any(Function));

    // プラグイン関数を実行
    pluginFunction(mockNuxtApp);

    // QueryClientが適切な設定で作成されることを確認
    expect(mockQueryClientConstructor).toHaveBeenCalledWith({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          refetchOnWindowFocus: false,
          refetchOnMount: true,
          retry: 1,
        },
      },
    });
  });

  test('VueアプリにVue Queryプラグインが統合されること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    // Vue Queryがアプリケーションに統合されることを確認
    expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
      queryClient: mockQueryClient,
    });
  });

  test('ランタイム環境を適切に認識して動作すること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    expect(mockUseRuntime).toHaveBeenCalled();
  });

  test('状態管理のための適切なステートが初期化されること', async () => {
    await import('@/plugins/vue-query');

    pluginFunction(mockNuxtApp);

    expect(mockUseState).toHaveBeenCalledWith('vue-query');
  });

  describe('サーバーサイドレンダリングのサポート', () => {
    test('サーバー環境でデータのシリアライゼーションが設定されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: false },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:rendered', expect.any(Function));
    });

    test('サーバーでレンダリング時にクエリデータが保存されること', async () => {
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

      // レンダリング時の処理をシミュレート
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:rendered')?.[1];
      hookCallback();

      // サーバーでクエリデータが適切に保存されることを確認
      expect(mockVueQueryState.value).toBe(mockDehydratedState);
    });

    test('クライアント環境ではSSR用処理が実行されないこと', async () => {
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

  describe('クライアントサイドハイドレーションのサポート', () => {
    test('クライアント環境でデータのハイドレーションが設定されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:created', expect.any(Function));
    });

    test('クライアントでアプリ作成時にサーバーデータが復元されること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      const serverData: DehydratedState = { queries: [], mutations: [] };
      const mockVueQueryState = { value: serverData };
      mockUseState.mockReturnValue(mockVueQueryState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // アプリ作成時の処理をシミュレート
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:created')?.[1];
      hookCallback();

      // サーバーデータがクライアントで適切に復元されることを確認
      expect(mockHydrate).toHaveBeenCalledWith(mockQueryClient, serverData);
    });

    test('サーバー環境ではハイドレーション処理が実行されないこと', async () => {
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

  describe('ユニバーサルレンダリングの統合', () => {
    test('SSRとSPAの両方のモードで適切に動作すること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: true },
        isProcessClient: { value: true },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // 両環境での適切なフック登録を確認
      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:rendered', expect.any(Function));
      expect(mockNuxtApp.hooks.hook).toHaveBeenCalledWith('app:created', expect.any(Function));
    });

    test('特殊な環境でもエラーなく初期化できること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: false },
      });

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // 特殊な環境でもエラーを起こさないことを確認
      expect(mockNuxtApp.hooks.hook).not.toHaveBeenCalled();
    });
  });

  describe('Vue Queryの完全なユーザー体験', () => {
    test('サーバーサイドでデータ取得からクライアントへの引き継ぎが正常に動作すること', async () => {
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

      // Vue Queryがアプリケーションに統合されることを確認
      expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
        queryClient: mockQueryClient,
      });

      // サーバーデータの伝達処理をシミュレート
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:rendered')?.[1];
      hookCallback();

      // データがクライアントに適切に伝達されることを確認
      expect(mockVueQueryState.value).toBe(mockDehydratedState);
    });

    test('クライアントサイドでサーバーデータの復元が正常に動作すること', async () => {
      mockUseRuntime.mockReturnValue({
        isProcessServer: { value: false },
        isProcessClient: { value: true },
      });

      const serverData: DehydratedState = { queries: [], mutations: [] };
      const mockVueQueryState = { value: serverData };
      mockUseState.mockReturnValue(mockVueQueryState);

      await import('@/plugins/vue-query');
      pluginFunction(mockNuxtApp);

      // Vue Queryがアプリケーションに統合されることを確認
      expect(mockVueApp.use).toHaveBeenCalledWith(mockVueQueryPlugin, {
        queryClient: mockQueryClient,
      });

      // クライアントでのデータ復元処理をシミュレート
      const hookCallback = mockNuxtApp.hooks.hook.mock.calls.find((call) => call[0] === 'app:created')?.[1];
      hookCallback();

      // サーバーデータがクライアントで正常に復元されることを確認
      expect(mockHydrate).toHaveBeenCalledWith(mockQueryClient, serverData);
    });
  });
});
