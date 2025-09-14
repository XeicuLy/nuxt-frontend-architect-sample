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

// ユーティリティ関数：安全なファイル読み込み
function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ユーティリティ関数：安全なファイル書き込み
function writeFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// package.jsonからVoltaのNodeバージョンを取得
function getBaseNodeVersion(rootDir = process.cwd()): string {
  const packagePath = join(rootDir, 'package.json');
  const content = readFile(packagePath);

  const packageJson: PackageJson = JSON.parse(content);

  if (!packageJson.volta?.node) {
    throw new Error('Volta Node version not found in package.json');
  }

  return packageJson.volta.node;
}

// ファイルを安全に更新（変更があった場合のみ書き込み）
function updateFile(rootDir: string, target: SyncTarget, version: string, options: { dryRun?: boolean } = {}): SyncResult {
  const fullPath = join(rootDir, target.file);
  const content = readFile(fullPath);

  const match = content.match(target.pattern);
  const oldValue = match?.[0];
  const replacement = target.replacement(version);

  const updatedContent = content.replace(target.pattern, replacement);

  if (content === updatedContent) {
    return {
      file: target.file,
      updated: false,
      oldValue,
      newValue: replacement,
    };
  }

  // dry-runモードでは実際のファイル書き込みをスキップ
  if (!options.dryRun) {
    writeFile(fullPath, updatedContent);
  }

  return {
    file: target.file,
    updated: true,
    oldValue,
    newValue: replacement,
  };
}

// すべてのターゲットファイルを同期
function syncAllTargets(rootDir: string, targets: SyncTarget[], version: string, options: { dryRun?: boolean } = {}): SyncResult[] {
  return targets.map((target) => updateFile(rootDir, target, version, options));
}

// 結果をコンソールに出力
function logResults(baseVersion: string, results: SyncResult[], dryRun = false): void {
  const prefix = dryRun ? '[DRY RUN] ' : '';
  consola.box(`📦 ${prefix}Base version from Volta: ${baseVersion}`);

  results.forEach((result) => {
    if (result.updated) {
      const action = dryRun ? 'Would update' : 'Updated';
      consola.success(`${action} ${result.file}: ${result.oldValue} → ${result.newValue}`);
    } else {
      consola.info(`${result.file} already synchronized`);
    }
  });

  if (dryRun) {
    consola.box('🔍 DRY RUN: No files were modified');
    consola.info('💡 Run without --dry-run to apply changes');
  } else {
    consola.box('🎉 Node.js version synchronization completed!');
  }
  consola.info(`📋 Synchronized: Volta(${baseVersion}) → CI & README`);
  consola.info('🔧 Note: @types/node maintained independently for patches');
}

// 同期ターゲットの定義
function createSyncTargets(): SyncTarget[] {
  return [
    {
      file: '.github/workflows/ci.yaml',
      pattern: /NODE_VERSION:\s*[\d.]+/,
      replacement: (version) => `NODE_VERSION: ${version}`,
      description: 'CI environment',
    },
    {
      file: 'README.md',
      pattern: /Node\.js\*\* v[\d.]+/,
      replacement: (version) => `Node.js** v${version}`,
      description: 'Documentation',
    },
  ];
}

// メイン処理関数
async function main(): Promise<void> {
  try {
    // CLIオプションの解析
    const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');
    
    const rootDir = process.cwd();
    const baseVersion = getBaseNodeVersion(rootDir);
    const targets = createSyncTargets();

    const results = syncAllTargets(rootDir, targets, baseVersion, { dryRun });
    logResults(baseVersion, results, dryRun);
  } catch (error) {
    consola.error('❌ Error during synchronization:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
