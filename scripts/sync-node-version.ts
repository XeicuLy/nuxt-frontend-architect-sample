#!/usr/bin/env node

/**
 * Node.js Version Synchronization Script (TypeScript + Functional)
 *
 * このスクリプトは、Voltaで管理されているNodeバージョンを基準として、
 * プロジェクト内の関連ファイルのNodeバージョン表記を自動的に同期します。
 *
 * 【同期対象】
 * - .github/workflows/ci.yaml の NODE_VERSION
 * - README.md の Node.js バージョン記載
 *
 * 【特徴】
 * - 純粋関数を多用した関数型プログラミングアプローチ
 * - dry-runモードによる安全な確認実行
 * - 詳細なエラーハンドリングとユーザビリティ
 *
 * 【注意】
 * @types/nodeは独立管理（パッチ更新保持のため）
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { consola } from 'consola';

/** package.jsonファイル名 */
const PACKAGE_JSON_FILENAME = 'package.json' as const;

/** 文字エンコーディング */
const FILE_ENCODING = 'utf8' as const;

/**
 * Volta設定の型定義
 * package.jsonのvolta設定に対応
 */
interface VoltaConfig {
  /** Nodeバージョン（例: "20.10.0"） */
  node: string;
  /** pnpmバージョン（オプション、例: "8.15.0"） */
  pnpm?: string;
}

/**
 * package.jsonファイルの構造を表す型定義
 * 必要な部分のみを定義（部分型）
 */
interface PackageJson {
  /** プロジェクト名 */
  name: string;
  /** Volta設定（バージョン管理ツール） */
  volta?: VoltaConfig;
  /** Node.jsエンジン制約 */
  engines?: {
    /** Nodeバージョン制約（例: ">=20.0.0"） */
    node?: string;
    /** pnpmバージョン制約（例: ">=8.0.0"） */
    pnpm?: string;
  };
  /** 本番依存関係 */
  dependencies?: Record<string, string>;
  /** 開発依存関係 */
  devDependencies?: Record<string, string>;
}

/**
 * ファイル同期処理の結果を表す型
 * 各ファイルの更新状況を追跡
 */
interface SyncResult {
  /** 対象ファイル名 */
  file: string;
  /** 更新が行われたかどうか */
  updated: boolean;
  /** 更新前の値（マッチした部分文字列） */
  oldValue?: string;
  /** 更新後の新しい値 */
  newValue?: string;
}

/**
 * 同期対象ファイルの設定を表す型
 * パターンマッチングと置換方法を定義
 */
interface SyncTarget {
  /** 対象ファイルのパス（プロジェクトルートからの相対パス） */
  file: string;
  /** マッチング用の正規表現パターン */
  pattern: RegExp;
  /** バージョンを受け取って置換文字列を生成する関数 */
  replacement: (version: string) => string;
  /** 人間が読める形での対象の説明 */
  description: string;
}

/**
 * スクリプトの実行オプション
 * コマンドライン引数から解析される設定
 */
interface SyncOptions {
  /** dry-runモード（実際にファイルを変更しない）のフラグ */
  dryRun?: boolean;
}

/**
 * ファイルを安全に読み込む純粋関数
 * @param filePath - 読み込むファイルのパス
 * @returns ファイルの内容（UTF-8エンコーディング）
 * @throws {Error} ファイル読み込みに失敗した場合
 * @example
 * const content = readFile('/path/to/file.json');
 */
const readFile = (filePath: string): string => {
  try {
    return readFileSync(filePath, FILE_ENCODING);
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${extractErrorMessage(error)}`);
  }
};

/**
 * ファイルに内容を安全に書き込む関数
 * @param filePath - 書き込み先ファイルのパス
 * @param content - 書き込む内容
 * @throws {Error} ファイル書き込みに失敗した場合
 * @example
 * writeFile('/path/to/file.txt', 'Hello World');
 */
const writeFile = (filePath: string, content: string): void => {
  try {
    writeFileSync(filePath, content, FILE_ENCODING);
  } catch (error) {
    throw new Error(`Failed to write ${filePath}: ${extractErrorMessage(error)}`);
  }
};

/**
 * JSON文字列を安全にパースする純粋関数
 * @template T - パース結果の型
 * @param content - パースするJSON文字列
 * @returns パース結果のオブジェクト
 * @throws {Error} JSON解析に失敗した場合
 * @example
 * const data = parseJson<PackageJson>('{"name": "example"}');
 */
const parseJson = <T>(content: string): T => {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Invalid JSON: ${extractErrorMessage(error, 'Parse error')}`);
  }
};

/**
 * 安全なエラーメッセージ抽出の純粋関数
 * unknown型のエラーオブジェクトから安全にメッセージを抽出します
 *
 * @param error - エラーオブジェクト（型不明）
 * @param fallback - エラーメッセージが取得できない場合のフォールバック
 * @returns エラーメッセージ文字列
 *
 * @example
 * const message = extractErrorMessage(new Error('test'), 'Unknown error');
 * // 'test'
 *
 * const message2 = extractErrorMessage('string error', 'Unknown error');
 * // 'Unknown error'
 */
const extractErrorMessage = (error: unknown, fallback = 'Unknown error'): string => {
  return error instanceof Error ? error.message : fallback;
};

/**
 * package.jsonからVolta設定のNodeバージョンを取得する純粋関数
 *
 * この関数はプロジェクトの基準となるNodeバージョンを取得します。
 * Volta設定がない場合はエラーを投げます。
 *
 * @param rootDir - プロジェクトのルートディレクトリパス（デフォルト: 現在の作業ディレクトリ）
 * @returns VoltaのNodeバージョン（例: "20.10.0"）
 * @throws {Error} Volta設定が見つからない場合、またはファイル読み込みに失敗した場合
 *
 * @example
 * const version = getBaseNodeVersion('/path/to/project');
 * console.log(version); // "20.10.0"
 */
const getBaseNodeVersion = (rootDir: string = process.cwd()): string => {
  const packagePath = join(rootDir, PACKAGE_JSON_FILENAME);
  const content = readFile(packagePath);
  const packageJson = parseJson<PackageJson>(content);

  if (!packageJson.volta?.node) {
    throw new Error(`Volta Node version not found in ${PACKAGE_JSON_FILENAME}`);
  }

  return packageJson.volta.node;
};

/**
 * ファイル内容を更新する純粋関数
 *
 * 指定されたパターンを新しいバージョンに置き換えた内容を作成します。
 * 元の内容は変更せず、新しい内容を返します（副作用なし）。
 *
 * @param content - 元のファイル内容
 * @param target - 同期対象の設定（パターンと置換方法）
 * @param version - 置き換えるNodeバージョン
 * @returns 更新情報を含むオブジェクト
 * @throws {Error} パターンが見つからない場合
 *
 * @example
 * const result = createUpdatedContent(
 *   'NODE_VERSION: 18.0.0',
 *   { pattern: /NODE_VERSION:\s*[\d.]+/, replacement: (v) => `NODE_VERSION: ${v}` },
 *   '20.10.0'
 * );
 * // result.content === 'NODE_VERSION: 20.10.0'
 */
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

/**
 * 指定されたファイルを安全に更新する関数
 *
 * ファイルを読み込み、パターンマッチングでバージョンを更新し、
 * dry-runモードでない場合のみ実際に書き込みを行います。
 *
 * @param rootDir - プロジェクトのルートディレクトリパス
 * @param target - 更新対象の設定（ファイルパス、パターン、置換方法など）
 * @param version - 更新するNodeバージョン
 * @param options - 実行オプション（dry-runフラグなど）
 * @returns 更新結果の情報
 * @throws {Error} ファイル読み書きまたはパターンマッチングに失敗した場合
 *
 * @example
 * const result = updateFile('/project', {
 *   file: '.github/workflows/ci.yaml',
 *   pattern: /NODE_VERSION:\s*[\d.]+/,
 *   replacement: (v) => `NODE_VERSION: ${v}`,
 *   description: 'CI environment'
 * }, '20.10.0');
 */
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

/**
 * すべての対象ファイルを一括で同期する純粋関数
 *
 * 複数のファイルを順次処理し、それぞれのNodeバージョンを更新します。
 * 各ファイルの処理は独立しており、一つが失敗しても他には影響しません。
 *
 * @param rootDir - プロジェクトのルートディレクトリパス
 * @param targets - 更新対象のファイル設定リスト（読み取り専用）
 * @param version - 更新するNodeバージョン
 * @param options - 実行オプション（dry-runフラグなど）
 * @returns 各ファイルの更新結果のリスト（読み取り専用）
 *
 * @example
 * const results = syncAllTargets('/project', [
 *   { file: 'README.md', pattern: /Node\.js\*\* v[\d.]+/, ... },
 *   { file: '.github/workflows/ci.yaml', pattern: /NODE_VERSION:\s*[\d.]+/, ... }
 * ], '20.10.0');
 */
const syncAllTargets = (
  rootDir: string,
  targets: readonly SyncTarget[],
  version: string,
  options: SyncOptions = {},
): readonly SyncResult[] => {
  return targets.map((target) => updateFile(rootDir, target, version, options));
};

/**
 * 同期結果をユーザー向けメッセージに変換する純粋関数
 *
 * 更新があったかどうか、dry-runモードかどうかに応じて
 * 適切なメッセージとログレベルを決定します。
 *
 * @param result - ファイルの同期結果
 * @param dryRun - dry-runモードかどうか
 * @returns ログメッセージの情報（タイプとメッセージ）
 *
 * @example
 * const msg = formatResultMessage(
 *   { file: 'README.md', updated: true, oldValue: 'v18.0.0', newValue: 'v20.10.0' },
 *   false
 * );
 * // { type: 'success', message: 'Updated README.md: v18.0.0 → v20.10.0' }
 */
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

/**
 * 同期処理の結果をコンソールに美しく出力する関数
 *
 * 基準となるVoltaのバージョン、各ファイルの更新結果、
 * 実行モード（dry-run/実行）に応じた適切なメッセージを表示します。
 *
 * @param baseVersion - VoltaのNodeバージョン
 * @param results - 各ファイルの同期結果のリスト（読み取り専用）
 * @param dryRun - dry-runモードかどうか（デフォルト: false）
 *
 * @example
 * logResults('20.10.0', [
 *   { file: 'README.md', updated: true, oldValue: 'v18.0.0', newValue: 'v20.10.0' }
 * ], false);
 * // コンソールに色付きのメッセージが出力される
 */
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

/**
 * 同期対象のファイル設定を生成する純粋関数
 *
 * Nodeバージョンを同期する必要があるファイルの設定を定義します。
 * 新しいファイルを追加する場合は、この配列に設定を追加してください。
 *
 * @returns 同期対象の設定リスト（読み取り専用の配列）
 *
 * @example
 * const targets = createSyncTargets();
 * // [
 * //   { file: '.github/workflows/ci.yaml', pattern: /NODE_VERSION:\s*[\d.]+/, ... },
 * //   { file: 'README.md', pattern: /Node\.js\*\* v[\d.]+/, ... }
 * // ]
 */
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

/**
 * コマンドライン引数を解析する純粋関数
 *
 * process.argvから実行オプションを抽出します。
 * 現在は dry-run オプションのみサポートしています。
 *
 * @param argv - コマンドライン引数のリスト（読み取り専用）
 * @returns 実行オプション
 *
 * @example
 * const options = parseCliArgs(['node', 'script.js', '--dry-run']);
 * // { dryRun: true }
 *
 * const options2 = parseCliArgs(['node', 'script.js']);
 * // { dryRun: false }
 */
const parseCliArgs = (argv: readonly string[]): SyncOptions => ({
  dryRun: argv.includes('--dry-run') || argv.includes('-n'),
});

/**
 * 同期処理のメインパイプライン
 *
 * Volta設定の取得から結果出力まで、同期処理の全工程を統合します。
 * 各ステップは純粋関数で構成され、エラーは上位に委譲されます。
 *
 * @param rootDir - プロジェクトのルートディレクトリパス
 * @param options - 実行オプション
 * @throws {Error} いずれかのステップでエラーが発生した場合
 *
 * @example
 * executeSync('/path/to/project', { dryRun: true });
 * // プロジェクトの全ファイルを dry-run モードで同期
 */
const executeSync = (rootDir: string, options: SyncOptions): void => {
  const baseVersion = getBaseNodeVersion(rootDir);
  const targets = createSyncTargets();
  const results = syncAllTargets(rootDir, targets, baseVersion, options);

  logResults(baseVersion, results, options.dryRun ?? false);
};

/**
 * スクリプトのエントリーポイント
 *
 * コマンドライン引数を解析し、同期処理を実行します。
 * エラーが発生した場合は適切なメッセージを表示してプロセスを終了します。
 *
 * @throws {Error} 同期処理中にエラーが発生した場合（プロセス終了）
 *
 * @example
 * // コマンドライン実行時:
 * // $ node sync-node-version.ts --dry-run
 * // dry-runモードで実行される
 */
const main = async (): Promise<void> => {
  try {
    const options = parseCliArgs(process.argv);
    const rootDir = process.cwd();

    executeSync(rootDir, options);
  } catch (error) {
    consola.error('❌ Error during synchronization:', extractErrorMessage(error));
    process.exit(1);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
