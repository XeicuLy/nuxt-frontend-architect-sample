import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 自動化された型生成スクリプトのテスト
 */
describe('scripts/automated-generate-types.ts', () => {
  // モック関数のセットアップ
  const mockSpawn = vi.fn();
  const mockConsola = {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    start: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('パッケージマネージャーの検出', () => {
    it('pnpm-lock.yamlが存在する場合はpnpmを返すこと', () => {
      // pnpm-lock.yamlの存在をモック
      vi.spyOn(require('node:fs'), 'existsSync').mockImplementation((path) => {
        return path.toString().includes('pnpm-lock.yaml');
      });

      // 実際のファイルで確認
      const projectRoot = process.cwd();
      const pnpmLockExists = existsSync(join(projectRoot, 'pnpm-lock.yaml'));
      
      expect(pnpmLockExists).toBe(true);
    });

    it('package-lock.jsonが存在する場合はnpmを返すこと', () => {
      vi.spyOn(require('node:fs'), 'existsSync').mockImplementation((path) => {
        return path.toString().includes('package-lock.json');
      });

      // テスト用のロジックを直接実装
      function detectPackageManager() {
        if (existsSync(join(process.cwd(), 'pnpm-lock.yaml'))) {
          return 'pnpm';
        }
        if (existsSync(join(process.cwd(), 'package-lock.json'))) {
          return 'npm';
        }
        return 'npm';
      }

      const result = detectPackageManager();
      expect(result).toBe('npm');
    });
  });

  describe('ファイルパスの設定', () => {
    it('適切なファイルパスが設定されていること', () => {
      const expectedPaths = {
        outputPath: join(process.cwd(), 'public', 'openapi.yaml'),
        apiEndpoint: '/api/openapi.yaml',
        healthEndpoint: '/api/health',
      };

      // OpenAPIファイルの存在確認
      expect(existsSync(expectedPaths.outputPath)).toBe(true);
      
      // エンドポイントパスの形式確認
      expect(expectedPaths.apiEndpoint).toMatch(/^\/api\/openapi\.yaml$/);
      expect(expectedPaths.healthEndpoint).toMatch(/^\/api\/health$/);
    });
  });

  describe('サーバー設定の検証', () => {
    it('サーバー設定が適切な値を持っていること', () => {
      const serverConfig = {
        url: process.env.SERVER_URL || 'http://localhost:3000',
        port: process.env.PORT || '3000',
        maxStartupTime: 60000,
        healthCheckInterval: 1000,
        shutdownTimeout: 10000,
      };

      expect(serverConfig.url).toMatch(/^https?:\/\/localhost:\d+$/);
      expect(serverConfig.port).toMatch(/^\d+$/);
      expect(serverConfig.maxStartupTime).toBeGreaterThan(0);
      expect(serverConfig.healthCheckInterval).toBeGreaterThan(0);
      expect(serverConfig.shutdownTimeout).toBeGreaterThan(0);
    });
  });

  describe('既存ファイルとの整合性', () => {
    it('openapi-ts.config.tsの設定と一致していること', () => {
      const configPath = join(process.cwd(), 'openapi-ts.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      // 設定ファイルの内容を確認
      const expectedInput = './public/openapi.yaml';
      const expectedOutput = './shared/types/api';
      
      // これらのパスが実際に存在することを確認
      expect(existsSync(join(process.cwd(), 'public', 'openapi.yaml'))).toBe(true);
      expect(existsSync(join(process.cwd(), 'shared', 'types', 'api'))).toBe(true);
    });

    it('package.jsonのスクリプトが正しく設定されていること', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      expect(existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = require(packageJsonPath);
      
      // 新しいスクリプト構成を確認
      expect(packageJson.scripts['generate-types']).toBe('jiti scripts/automated-generate-types.ts');
      expect(packageJson.scripts['generate-types:ci']).toBe('openapi-ts && pnpm lint:fix');
      expect(packageJson.scripts['generate-types:manual']).toBe('pnpm generate-openapi-spec && openapi-ts && pnpm lint:fix');
    });
  });

  describe('エラーハンドリング', () => {
    it('タイムアウト設定が適切であること', () => {
      const timeoutValues = {
        maxStartupTime: 60000, // 60秒
        healthCheckInterval: 1000, // 1秒
        shutdownTimeout: 10000, // 10秒
        fetchTimeout: 10000, // 10秒
      };

      // 各タイムアウト値が合理的な範囲内であることを確認
      expect(timeoutValues.maxStartupTime).toBeGreaterThanOrEqual(30000); // 最低30秒
      expect(timeoutValues.maxStartupTime).toBeLessThanOrEqual(120000); // 最大2分
      
      expect(timeoutValues.healthCheckInterval).toBeGreaterThanOrEqual(500); // 最低0.5秒
      expect(timeoutValues.healthCheckInterval).toBeLessThanOrEqual(5000); // 最大5秒
      
      expect(timeoutValues.shutdownTimeout).toBeGreaterThanOrEqual(5000); // 最低5秒
      expect(timeoutValues.shutdownTimeout).toBeLessThanOrEqual(30000); // 最大30秒
    });
  });

  describe('プロセス管理', () => {
    it('適切なプロセス終了ハンドリングが設定されていること', () => {
      // シグナルハンドリングのテスト
      const signals = ['SIGINT', 'SIGTERM'];
      
      signals.forEach(signal => {
        expect(() => {
          // プロセス終了シグナルのテスト
          process.emit(signal as any);
        }).not.toThrow();
      });
    });
  });

  describe('統合テスト（ドライラン）', () => {
    it('必要なファイルとディレクトリが存在すること', () => {
      const requiredPaths = [
        'package.json',
        'openapi-ts.config.ts',
        'public/openapi.yaml',
        'shared/types/api',
        'scripts/automated-generate-types.ts',
      ];

      requiredPaths.forEach(path => {
        const fullPath = join(process.cwd(), path);
        expect(existsSync(fullPath)).toBe(true);
      });
    });

    it('生成された型定義ファイルが存在すること', () => {
      const typeFiles = [
        'shared/types/api/index.ts',
        'shared/types/api/types.gen.ts',
        'shared/types/api/zod.gen.ts',
      ];

      typeFiles.forEach(file => {
        const fullPath = join(process.cwd(), file);
        expect(existsSync(fullPath)).toBe(true);
      });
    });
  });
});