import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import consola from 'consola';

/**
 * 自動化された型生成スクリプト
 * 開発サーバーの起動から型生成、サーバー停止までを一括処理
 */

/**
 * 利用可能なパッケージマネージャーを検出
 */
function detectPackageManager(): string {
  // pnpm-lock.yaml が存在する場合はpnpmを優先
  if (existsSync(join(process.cwd(), 'pnpm-lock.yaml'))) {
    try {
      // pnpmが利用可能かチェック
      spawn('pnpm', ['--version'], { stdio: 'pipe' });
      return 'pnpm';
    } catch {
      // pnpmが利用できない場合はnpmにフォールバック
      consola.warn('⚠️  pnpmが見つかりません。npmを使用します。');
    }
  }
  
  // package-lock.json が存在する場合はnpm
  if (existsSync(join(process.cwd(), 'package-lock.json'))) {
    return 'npm';
  }
  
  // yarn.lock が存在する場合はyarn
  if (existsSync(join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  
  // デフォルトはnpm
  return 'npm';
}

/** パッケージマネージャー */
const PACKAGE_MANAGER = detectPackageManager();

/** サーバー設定 */
const SERVER_CONFIG = {
  url: process.env.SERVER_URL || 'http://localhost:3000',
  port: process.env.PORT || '3000',
  maxStartupTime: 60000, // 60秒
  healthCheckInterval: 1000, // 1秒間隔
  shutdownTimeout: 10000, // 10秒
} as const;

/** ファイルパス設定 */
const PATHS = {
  outputPath: join(process.cwd(), 'public', 'openapi.yaml'),
  apiEndpoint: '/api/openapi.yaml',
  healthEndpoint: '/api/health',
} as const;

/**
 * サーバープロセスを管理するクラス
 */
class ServerManager {
  private process: ChildProcess | null = null;
  private isShuttingDown = false;

  /**
   * 開発サーバーを起動
   */
  async start(): Promise<void> {
    consola.info(`🚀 開発サーバーを起動中... (${PACKAGE_MANAGER})`);

    return new Promise((resolve, reject) => {
      // dev コマンドでサーバーを起動
      const devCommand = PACKAGE_MANAGER === 'npm' ? 'run' : '';
      const args = devCommand ? [devCommand, 'dev'] : ['dev'];
      
      this.process = spawn(PACKAGE_MANAGER, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });

      if (!this.process) {
        reject(new Error('サーバープロセスの起動に失敗しました'));
        return;
      }

      // プロセス終了時の処理
      this.process.on('exit', (code) => {
        if (!this.isShuttingDown && code !== 0) {
          reject(new Error(`サーバープロセスが異常終了しました (code: ${code})`));
        }
      });

      // エラーハンドリング
      this.process.on('error', (error) => {
        reject(new Error(`サーバー起動エラー: ${error.message}`));
      });

      // 標準出力の監視（起動完了の検知）
      this.process.stdout?.on('data', (data) => {
        const output = data.toString();
        consola.debug('Server stdout:', output);
        
        // Nuxtの起動完了メッセージを検知
        if (output.includes('Local:') && output.includes(SERVER_CONFIG.port)) {
          consola.success('✅ サーバーが起動しました');
          resolve();
        }
      });

      this.process.stderr?.on('data', (data) => {
        const output = data.toString();
        consola.debug('Server stderr:', output);
        
        // エラーでない場合もstderrに出力される場合があるので、
        // 特定のエラーパターンのみをチェック
        if (output.includes('Error:') || output.includes('EADDRINUSE')) {
          reject(new Error(`サーバーエラー: ${output}`));
        }
      });

      // タイムアウト処理
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          reject(new Error(`サーバー起動がタイムアウトしました (${SERVER_CONFIG.maxStartupTime}ms)`));
        }
      }, SERVER_CONFIG.maxStartupTime);
    });
  }

  /**
   * サーバーの起動完了を待機
   */
  async waitForReady(): Promise<void> {
    consola.info('⏳ サーバーの起動完了を待機中...');

    const startTime = Date.now();
    
    while (Date.now() - startTime < SERVER_CONFIG.maxStartupTime) {
      try {
        // ヘルスチェックエンドポイントで確認
        const response = await fetch(`${SERVER_CONFIG.url}${PATHS.healthEndpoint}`, {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          consola.success('✅ サーバーが利用可能になりました');
          return;
        }
      } catch (error) {
        // ヘルスチェックが失敗した場合は、OpenAPIエンドポイントで確認
        try {
          const response = await fetch(`${SERVER_CONFIG.url}${PATHS.apiEndpoint}`, {
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            consola.success('✅ サーバーが利用可能になりました');
            return;
          }
        } catch {
          // 両方失敗した場合は次のループへ
        }
      }

      // 次のチェックまで待機
      await new Promise(resolve => setTimeout(resolve, SERVER_CONFIG.healthCheckInterval));
    }

    throw new Error('サーバーの起動確認がタイムアウトしました');
  }

  /**
   * サーバーを停止
   */
  async stop(): Promise<void> {
    if (!this.process) {
      consola.info('停止するプロセスがありません');
      return;
    }

    consola.info('🛑 サーバーを停止中...');
    this.isShuttingDown = true;

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      // プロセス終了時の処理
      this.process.once('exit', () => {
        consola.success('✅ サーバーが停止しました');
        this.process = null;
        resolve();
      });

      // Graceful shutdown を試行
      this.process.kill('SIGTERM');

      // タイムアウト後に強制終了
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          consola.warn('⚠️  強制終了します');
          this.process.kill('SIGKILL');
        }
      }, SERVER_CONFIG.shutdownTimeout);
    });
  }
}

/**
 * OpenAPIスペックを取得してファイルに保存
 */
async function fetchAndSaveOpenApiSpec(): Promise<void> {
  const forceGenerate = process.argv.includes('--force');

  // 既存ファイルのチェック
  if (existsSync(PATHS.outputPath) && !forceGenerate) {
    consola.info(`OpenAPIスペックは既に存在します: ${PATHS.outputPath}`);
    consola.info('強制更新する場合は --force フラグを使用してください');
    return;
  }

  try {
    consola.info(`📥 OpenAPIスペックを取得中: ${SERVER_CONFIG.url}${PATHS.apiEndpoint}`);

    const response = await fetch(`${SERVER_CONFIG.url}${PATHS.apiEndpoint}`, {
      headers: {
        Accept: 'text/yaml, application/x-yaml',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`OpenAPIスペックの取得に失敗: ${response.status} ${response.statusText}`);
    }

    const spec = await response.text();

    // ディレクトリの作成
    mkdirSync(dirname(PATHS.outputPath), { recursive: true });

    // ファイルに保存
    writeFileSync(PATHS.outputPath, spec, 'utf-8');

    consola.success(`💾 OpenAPIスペックを保存しました: ${PATHS.outputPath}`);
  } catch (error) {
    consola.error('OpenAPIスペックの取得に失敗:', error);

    if (existsSync(PATHS.outputPath)) {
      consola.warn('⚠️  既存のOpenAPIスペックファイルを使用します');
      return;
    }

    throw new Error('OpenAPIスペックの取得に失敗し、既存ファイルも見つかりませんでした');
  }
}

/**
 * 型定義を生成
 */
async function generateTypes(): Promise<void> {
  consola.info('🔧 型定義を生成中...');

  return new Promise((resolve, reject) => {
    const generateCommand = PACKAGE_MANAGER === 'npm' ? 'run' : 'run';
    const args = [generateCommand, 'generate-types:ci'];
    
    const process = spawn(PACKAGE_MANAGER, args, {
      stdio: 'inherit',
    });

    process.on('exit', (code) => {
      if (code === 0) {
        consola.success('✅ 型定義の生成が完了しました');
        resolve();
      } else {
        reject(new Error(`型定義の生成に失敗しました (code: ${code})`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`型定義生成エラー: ${error.message}`));
    });
  });
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  const serverManager = new ServerManager();
  let serverStarted = false;

  try {
    consola.start('🎯 自動化された型生成プロセスを開始します...');

    // 1. サーバー起動
    await serverManager.start();
    serverStarted = true;

    // 2. サーバーの準備完了を待機
    await serverManager.waitForReady();

    // 3. OpenAPIスペックの取得
    await fetchAndSaveOpenApiSpec();

    // 4. サーバー停止
    await serverManager.stop();
    serverStarted = false;

    // 5. 型定義生成
    await generateTypes();

    consola.success('🎉 すべての処理が正常に完了しました！');
  } catch (error) {
    consola.error('❌ 処理中にエラーが発生しました:', error);

    // サーバーが起動している場合は停止
    if (serverStarted) {
      try {
        await serverManager.stop();
      } catch (stopError) {
        consola.error('サーバー停止時にエラーが発生:', stopError);
      }
    }

    process.exit(1);
  }
}

// スクリプト実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  // プロセス終了時のクリーンアップ
  process.on('SIGINT', () => {
    consola.info('プロセスが中断されました');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    consola.info('プロセスが終了されました');
    process.exit(0);
  });

  main().catch((error) => {
    consola.error('予期しないエラーが発生しました:', error);
    process.exit(1);
  });
}