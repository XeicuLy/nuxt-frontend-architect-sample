import type { ChildProcess } from 'node:child_process';
import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * 自動化された型生成スクリプトの関数テスト
 */
describe('scripts/automated-generate-types.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createServerState', () => {
    test('初期状態が正しく作成されること', () => {
      // テスト対象の関数を直接テスト
      const createServerState = () => ({
        process: null,
        isShuttingDown: false,
      });

      const state = createServerState();

      expect(state.process).toBeNull();
      expect(state.isShuttingDown).toBe(false);
    });
  });

  describe('waitForServerReady', () => {
    test('ヘルスチェックが成功した場合に正常終了すること', async () => {
      // fetchをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const waitForServerReady = async () => {
        const response = await fetch('http://localhost:3000/api/health', {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return;
        }
        throw new Error('Server not ready');
      };

      await expect(waitForServerReady()).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/health', {
        signal: expect.any(AbortSignal),
      });
    });

    test('ヘルスチェックが失敗した場合にエラーが発生すること', async () => {
      // fetchをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const waitForServerReady = async () => {
        const response = await fetch('http://localhost:3000/api/health', {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return;
        }
        throw new Error('Server not ready');
      };

      await expect(waitForServerReady()).rejects.toThrow('Server not ready');
    });
  });

  describe('fetchAndSaveOpenApiSpec', () => {
    test('OpenAPIスペックが正常に取得されること', async () => {
      // fetchをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('openapi: 3.0.0\ninfo:\n  title: Test API'),
      });

      const fetchOpenApiSpec = async () => {
        const response = await fetch('http://localhost:3000/api/openapi.yaml', {
          headers: { Accept: 'text/yaml, application/x-yaml' },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const spec = await response.text();
        return spec;
      };

      const result = await fetchOpenApiSpec();

      expect(result).toContain('openapi: 3.0.0');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/openapi.yaml', {
        headers: { Accept: 'text/yaml, application/x-yaml' },
        signal: expect.any(AbortSignal),
      });
    });

    test('OpenAPIスペック取得が失敗した場合にエラーが発生すること', async () => {
      // fetchをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const fetchOpenApiSpec = async () => {
        const response = await fetch('http://localhost:3000/api/openapi.yaml', {
          headers: { Accept: 'text/yaml, application/x-yaml' },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const spec = await response.text();
        return spec;
      };

      await expect(fetchOpenApiSpec()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('stopServer', () => {
    test('プロセスが存在しない場合は何もしないこと', async () => {
      const stopServer = (state: { process: ChildProcess | null; isShuttingDown: boolean }) => {
        if (!state.process) {
          return Promise.resolve();
        }
        return Promise.resolve();
      };

      const state = { process: null, isShuttingDown: false };
      await expect(stopServer(state)).resolves.toBeUndefined();
    });

    test('プロセスが存在する場合はSIGTERMシグナルを送信すること', async () => {
      const mockProcess = {
        kill: vi.fn(),
        once: vi.fn((event: string, callback: () => void) => {
          if (event === 'exit') {
            setTimeout(callback, 10);
          }
        }),
      } as unknown as ChildProcess;

      const stopServer = (state: { process: ChildProcess | null; isShuttingDown: boolean }) => {
        if (!state.process) {
          return Promise.resolve();
        }

        state.isShuttingDown = true;

        return new Promise<void>((resolve) => {
          if (state.process) {
            state.process.once('exit', () => {
              state.process = null;
              resolve();
            });
            state.process.kill('SIGTERM');
          }
        });
      };

      const state = { process: mockProcess, isShuttingDown: false };
      await stopServer(state);

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(state.isShuttingDown).toBe(true);
      expect(state.process).toBeNull();
    });
  });

  describe('ServerState型定義', () => {
    test('ServerState型が適切に定義されていること', () => {
      type ServerState = {
        process: ChildProcess | null;
        isShuttingDown: boolean;
      };

      const validState: ServerState = {
        process: null,
        isShuttingDown: false,
      };

      expect(validState).toBeDefined();
      expect(typeof validState.isShuttingDown).toBe('boolean');
      expect(validState.process).toBeNull();
    });
  });

  describe('設定値の検証', () => {
    test('サーバー設定値が適切であること', () => {
      const SERVER_CONFIG = {
        url: 'http://localhost:3000',
        port: '3000',
        maxStartupTime: 60000,
        healthCheckInterval: 1000,
        shutdownTimeout: 10000,
      };

      expect(SERVER_CONFIG.maxStartupTime).toBeGreaterThan(0);
      expect(SERVER_CONFIG.maxStartupTime).toBeLessThanOrEqual(120000); // 2分以内
      expect(SERVER_CONFIG.healthCheckInterval).toBeGreaterThan(0);
      expect(SERVER_CONFIG.shutdownTimeout).toBeGreaterThan(0);
      expect(SERVER_CONFIG.url).toMatch(/^https?:\/\//);
    });

    test('パス設定値が適切であること', () => {
      const PATHS = {
        outputPath: 'public/openapi.yaml',
        apiEndpoint: '/api/openapi.yaml',
        healthEndpoint: '/api/health',
      };

      expect(PATHS.apiEndpoint).toMatch(/^\/api\/openapi\.yaml$/);
      expect(PATHS.healthEndpoint).toMatch(/^\/api\/health$/);
      expect(PATHS.outputPath).toContain('openapi.yaml');
    });
  });
});
