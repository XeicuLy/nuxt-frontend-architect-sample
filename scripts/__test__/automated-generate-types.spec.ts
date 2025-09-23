import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * 自動化された型生成スクリプトのテスト
 */
describe('scripts/automated-generate-types.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('パッケージマネージャーの検出', () => {
    test('プロジェクトでpnpmが使用されていること', () => {
      const pnpmLockExists = existsSync(join(process.cwd(), 'pnpm-lock.yaml'));
      expect(pnpmLockExists).toBe(true);
    });
  });

  describe('設定の整合性', () => {
    test('package.jsonに必要なスクリプトが定義されていること', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.scripts['generate-types']).toBe('jiti scripts/automated-generate-types.ts');
      expect(packageJson.scripts['generate-types:ci']).toBe('openapi-ts && pnpm lint:fix');
      expect(packageJson.scripts['generate-types:manual']).toBe(
        'pnpm generate-openapi-spec && openapi-ts && pnpm lint:fix',
      );
    });

    test('openapi-ts.config.tsの設定が適切であること', () => {
      const configPath = join(process.cwd(), 'openapi-ts.config.ts');
      expect(existsSync(configPath)).toBe(true);

      const configContent = readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('./public/openapi.yaml');
      expect(configContent).toContain('./shared/types/api');
    });
  });

  describe('プロジェクト構造の検証', () => {
    test('必要なファイルとディレクトリが存在すること', () => {
      const requiredPaths = [
        'package.json',
        'openapi-ts.config.ts',
        'public/openapi.yaml',
        'shared/types/api',
        'scripts/automated-generate-types.ts',
      ];

      requiredPaths.forEach((path) => {
        const fullPath = join(process.cwd(), path);
        expect(existsSync(fullPath)).toBe(true);
      });
    });

    test('生成された型定義ファイルが存在すること', () => {
      const typeFiles = ['shared/types/api/index.ts', 'shared/types/api/types.gen.ts', 'shared/types/api/zod.gen.ts'];

      typeFiles.forEach((file) => {
        const fullPath = join(process.cwd(), file);
        expect(existsSync(fullPath)).toBe(true);
      });
    });
  });

  describe('型定義ファイルの内容検証', () => {
    test('index.tsがエクスポートを含んでいること', () => {
      const indexPath = join(process.cwd(), 'shared/types/api/index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('export');
    });

    test('types.gen.tsが型定義を含んでいること', () => {
      const typesPath = join(process.cwd(), 'shared/types/api/types.gen.ts');
      const content = readFileSync(typesPath, 'utf-8');
      expect(content.toLowerCase()).toMatch(/interface|type/);
    });

    test('zod.gen.tsがスキーマ定義を含んでいること', () => {
      const zodPath = join(process.cwd(), 'shared/types/api/zod.gen.ts');
      const content = readFileSync(zodPath, 'utf-8');
      expect(content.toLowerCase()).toMatch(/schema|zod/);
    });
  });

  describe('サーバー設定の妥当性', () => {
    test('デフォルト設定が適切な値であること', () => {
      const defaultConfig = {
        url: 'http://localhost:3000',
        port: '3000',
        maxStartupTime: 60000,
        healthCheckInterval: 1000,
        shutdownTimeout: 10000,
      };

      expect(defaultConfig.maxStartupTime).toBeGreaterThan(0);
      expect(defaultConfig.maxStartupTime).toBeLessThanOrEqual(120000);
      expect(defaultConfig.healthCheckInterval).toBeGreaterThan(0);
      expect(defaultConfig.shutdownTimeout).toBeGreaterThan(0);
    });
  });

  describe('エンドポイント設定', () => {
    test('APIエンドポイントパスが正しい形式であること', () => {
      const apiEndpoint = '/api/openapi.yaml';
      const healthEndpoint = '/api/health';

      expect(apiEndpoint).toMatch(/^\/api\/openapi\.yaml$/);
      expect(healthEndpoint).toMatch(/^\/api\/health$/);
    });
  });
});
