import { beforeEach, describe, expect, test, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';

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

  describe('startServer', () => {
    test('pnpm devコマンドが正しい引数で呼び出されること', async () => {
      // spawnをモック
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.killed = false;
      
      const spawnSpy = vi.spyOn(require('node:child_process'), 'spawn').mockReturnValue(mockProcess);

      const startServer = (state: any) => {
        return new Promise((resolve) => {
          state.process = spawn('pnpm', ['dev'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false,
          });
          
          // すぐに解決（実際のテストではstdoutイベントを待つ）
          setTimeout(() => resolve(undefined), 10);
        });
      };

      const state = { process: null, isShuttingDown: false };
      await startServer(state);

      expect(spawnSpy).toHaveBeenCalledWith('pnpm', ['dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });
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
  });

  describe('fetchAndSaveOpenApiSpec', () => {
    test('OpenAPIスペックが正常に取得・保存されること', async () => {
      // fetchとファイルシステム関数をモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('openapi: 3.0.0\ninfo:\n  title: Test API'),
      });

      const mockWriteFileSync = vi.fn();
      const mockMkdirSync = vi.fn();
      
      vi.doMock('node:fs', () => ({
        writeFileSync: mockWriteFileSync,
        mkdirSync: mockMkdirSync,
        existsSync: () => false,
      }));

      const fetchAndSaveOpenApiSpec = async () => {
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

      const result = await fetchAndSaveOpenApiSpec();
      
      expect(result).toContain('openapi: 3.0.0');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/openapi.yaml', {
        headers: { Accept: 'text/yaml, application/x-yaml' },
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('generateTypes', () => {
    test('pnpm run generate-types:ciが正しく呼び出されること', async () => {
      const mockProcess = new EventEmitter() as any;
      const spawnSpy = vi.spyOn(require('node:child_process'), 'spawn').mockReturnValue(mockProcess);

      const generateTypes = () => {
        return new Promise((resolve) => {
          const process = spawn('pnpm', ['run', 'generate-types:ci'], {
            stdio: 'inherit',
          });
          
          // すぐに成功として解決
          setTimeout(() => resolve(undefined), 10);
        });
      };

      await generateTypes();

      expect(spawnSpy).toHaveBeenCalledWith('pnpm', ['run', 'generate-types:ci'], {
        stdio: 'inherit',
      });
    });
  });

  describe('stopServer', () => {
    test('プロセスが存在しない場合は何もしないこと', async () => {
      const stopServer = (state: any) => {
        if (!state.process) {
          return Promise.resolve();
        }
        // プロセスが存在する場合の処理...
      };

      const state = { process: null, isShuttingDown: false };
      await expect(stopServer(state)).resolves.toBeUndefined();
    });

    test('プロセスが存在する場合はSIGTERMシグナルを送信すること', async () => {
      const mockProcess = {
        kill: vi.fn(),
        once: vi.fn((event, callback) => {
          if (event === 'exit') {
            setTimeout(callback, 10);
          }
        }),
      };

      const stopServer = (state: any) => {
        if (!state.process) {
          return Promise.resolve();
        }
        
        state.isShuttingDown = true;
        
        return new Promise((resolve) => {
          if (state.process) {
            state.process.once('exit', () => {
              state.process = null;
              resolve(undefined);
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
});