#!/usr/bin/env node

/**
 * Node.js Version Synchronization Script (TypeScript + Functional)
 *
 * Volta設定を基準として、CI環境とREADMEのバージョンを自動同期
 * @types/nodeは独立管理（パッチ更新保持のため）
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { consola } from 'consola';

// 型定義
interface VoltaConfig {
  node: string;
  pnpm?: string;
}

interface PackageJson {
  name: string;
  volta?: VoltaConfig;
  engines?: {
    node?: string;
    pnpm?: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface SyncResult {
  file: string;
  updated: boolean;
  oldValue?: string;
  newValue?: string;
}

interface SyncTarget {
  file: string;
  pattern: RegExp;
  replacement: (version: string) => string;
  description: string;
}

interface SyncOptions {
  dryRun?: boolean;
}

// シンプルなファイル操作関数（例外ベースのエラーハンドリング）
const readFile = (filePath: string): string => {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const writeFile = (filePath: string, content: string): void => {
  try {
    writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 安全なJSON.parseのラッパー
const parseJson = <T>(content: string): T => {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`);
  }
};

// package.jsonからVoltaのNodeバージョンを取得
const getBaseNodeVersion = (rootDir = process.cwd()): string => {
  const packagePath = join(rootDir, 'package.json');
  const content = readFile(packagePath);
  const packageJson = parseJson<PackageJson>(content);

  if (!packageJson.volta?.node) {
    throw new Error('Volta Node version not found in package.json');
  }

  return packageJson.volta.node;
};

// ファイル更新の純粋関数版
const createUpdatedContent = (
  content: string,
  target: SyncTarget,
  version: string,
): { content: string; oldValue?: string; replacement: string } => {
  const match = content.match(target.pattern);
  const oldValue = match?.[0];
  const replacement = target.replacement(version);

  if (!match) {
    throw new Error(`Pattern not found for "${target.description}" in ${target.file}`);
  }

  const updatedContent = content.replace(target.pattern, replacement);
  return { content: updatedContent, oldValue, replacement };
};

// ファイルを安全に更新
const updateFile = (rootDir: string, target: SyncTarget, version: string, options: SyncOptions = {}): SyncResult => {
  const fullPath = join(rootDir, target.file);
  const content = readFile(fullPath);
  const { content: updatedContent, oldValue, replacement } = createUpdatedContent(content, target, version);
  const isUpdated = content !== updatedContent;

  // dry-runモードでない場合のみ書き込み実行
  if (isUpdated && !options.dryRun) {
    writeFile(fullPath, updatedContent);
  }

  return {
    file: target.file,
    updated: isUpdated,
    oldValue,
    newValue: replacement,
  };
};

// すべてのターゲットファイルを同期
const syncAllTargets = (
  rootDir: string,
  targets: readonly SyncTarget[],
  version: string,
  options: SyncOptions = {},
): readonly SyncResult[] => {
  return targets.map((target) => updateFile(rootDir, target, version, options));
};

// ログ出力のヘルパー関数
const formatResultMessage = (result: SyncResult, dryRun: boolean): { type: 'success' | 'info'; message: string } => {
  if (result.updated) {
    const action = dryRun ? 'Would update' : 'Updated';
    return {
      type: 'success',
      message: `${action} ${result.file}: ${result.oldValue} → ${result.newValue}`,
    };
  }
  return {
    type: 'info',
    message: `${result.file} already synchronized`,
  };
};

// 結果をコンソールに出力
const logResults = (baseVersion: string, results: readonly SyncResult[], dryRun = false): void => {
  const prefix = dryRun ? '[DRY RUN] ' : '';
  consola.box(`📦 ${prefix}Base version from Volta: ${baseVersion}`);

  // 関数型的なログ出力
  results
    .map((result) => formatResultMessage(result, dryRun))
    .forEach(({ type, message }) => {
      if (type === 'success') {
        consola.success(message);
      } else {
        consola.info(message);
      }
    });

  const summaryMessage = dryRun
    ? ['🔍 DRY RUN: No files were modified', '💡 Run without --dry-run to apply changes']
    : ['🎉 Node.js version synchronization completed!'];

  summaryMessage.forEach((msg) => {
    consola.box(msg);
  });
  consola.info(`📋 Synchronized: Volta(${baseVersion}) → CI & README`);
  consola.info('🔧 Note: @types/node maintained independently for patches');
};

// 同期ターゲットの定義（不変配列として）
const createSyncTargets = (): readonly SyncTarget[] =>
  [
    {
      file: '.github/workflows/ci.yaml',
      pattern: /NODE_VERSION:\s*[\d.]+/,
      replacement: (version: string) => `NODE_VERSION: ${version}`,
      description: 'CI environment',
    },
    {
      file: 'README.md',
      pattern: /Node\.js\*\* v[\d.]+/,
      replacement: (version: string) => `Node.js** v${version}`,
      description: 'Documentation',
    },
  ] as const;

// CLI引数解析の純粋関数
const parseCliArgs = (argv: readonly string[]): SyncOptions => ({
  dryRun: argv.includes('--dry-run') || argv.includes('-n'),
});

// メイン処理の実行パイプライン
const executeSync = (rootDir: string, options: SyncOptions): void => {
  const baseVersion = getBaseNodeVersion(rootDir);
  const targets = createSyncTargets();
  const results = syncAllTargets(rootDir, targets, baseVersion, options);

  logResults(baseVersion, results, options.dryRun ?? false);
};

// メイン処理関数
const main = async (): Promise<void> => {
  try {
    const options = parseCliArgs(process.argv);
    const rootDir = process.cwd();

    executeSync(rootDir, options);
  } catch (error) {
    consola.error('❌ Error during synchronization:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
