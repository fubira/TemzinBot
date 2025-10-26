/**
 * アプリケーション作成
 * Bot のライフサイクル管理とエラーハンドリング
 */

import * as Readline from 'node:readline';
import { createBot, loadModule } from './bot';
import type { BotInstance } from './types';
import { CONSTANTS, CHAT_PATTERNS, getMinecraftConfig, type Env } from '@/config';
import { delay } from '@/utils';
import {
  answerModule,
  claude3Module,
  countdownModule,
  deathModule,
  geminiModule,
  googleModule,
  hiModule,
  openaiModule,
  urlRepeatModule,
  weatherModule,
} from '@/modules';

/**
 * アプリケーション状態型
 */
interface ApplicationState {
  bot: BotInstance | undefined;
  readline: Readline.Interface | undefined;
}

/**
 * モジュールを読み込み
 * 必要に応じてコメントアウトして無効化可能
 */
async function loadModules(bot: BotInstance): Promise<void> {
  // 基本モジュール
  await loadModule(bot, answerModule);
  await loadModule(bot, countdownModule);
  await loadModule(bot, deathModule);
  await loadModule(bot, googleModule);
  await loadModule(bot, weatherModule);

  // AIモジュール（APIキー必要）
  await loadModule(bot, geminiModule);
  await loadModule(bot, openaiModule);
  await loadModule(bot, claude3Module);

  // オプショナルモジュール（必要に応じてコメントアウト）
  await loadModule(bot, hiModule);
  await loadModule(bot, urlRepeatModule);
}

/**
 * Botを起動
 */
async function startBot(env: Env): Promise<{
  bot: BotInstance;
  readline: Readline.Interface;
}> {
  const config = getMinecraftConfig(env);

  // Readlineを先に作成（createBotで必要）
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Bot インスタンス作成
  const bot = createBot(
    {
      ...config,
      onLogin: () => {
        bot.setChatPattern(CHAT_PATTERNS);
      },
    },
    rl
  );

  // Readlineイベントハンドラー設定
  rl.setPrompt('> ');

  rl.on('line', (line: string) => {
    bot.chat.send(line, { delay: 0 });
  });

  rl.on('SIGINT', () => {
    bot.log('[readline] SIGINT');
    bot.log('Stopping Bot...');
    bot.setInterrupt(true);

    setTimeout(() => {
      bot.client.quit();
      rl.close();
      process.exit();
    }, CONSTANTS.SIGINT_TIMEOUT_MS);
  });

  // モジュールロード
  await loadModules(bot);

  return { bot, readline: rl };
}

/**
 * 安全にログを出力するヘルパー関数
 * Bot が初期化されていれば bot.log を、そうでなければ console を使用
 */
function safeLog(state: ApplicationState, message: string, level: 'log' | 'warn' = 'log'): void {
  if (state.bot) {
    state.bot.log(message);
    return;
  }

  // 早期リターンでネスト削減
  const logger = level === 'warn' ? console.warn : console.log;
  logger(message);
}

/**
 * エラー発生時の再接続処理（共通）
 */
function handleErrorAndReconnect(
  getState: () => ApplicationState,
  errorType: string,
  errorMessage: string,
  restartFn: () => Promise<void>
): void {
  const state = getState();
  if (state.bot) {
    state.bot.log(`[error] ${errorType}: ${errorMessage}`);
    state.bot.log(
      `[error] Attempting reconnection in ${CONSTANTS.RECONNECTION_DELAY_MS / 1000} seconds...`
    );
    state.bot.client.quit();

    delay(CONSTANTS.RECONNECTION_DELAY_MS)
      .then(() => {
        const currentState = getState();
        currentState.bot?.log('[system] Restarting bot...');
        return restartFn();
      })
      .catch((restartError) => {
        console.error('[error] Failed to restart bot after delay:', restartError);
        process.exit(1);
      });
  } else {
    console.error(`[error] ${errorType} (bot not initialized): ${errorMessage}`);
    process.exit(1);
  }
}

/**
 * エラーハンドラーをセットアップ
 */
function setupErrorHandlers(
  getState: () => ApplicationState,
  restartFn: () => Promise<void>,
  shutdownFn: () => void
): void {
  // uncaughtException: キャッチされなかった例外
  process.on('uncaughtException', (err) => {
    handleErrorAndReconnect(
      getState,
      'UncaughtException',
      `${err.message}\n${err.stack || ''}`,
      restartFn
    );
  });

  // unhandledRejection: キャッチされなかったPromise拒否
  process.on('unhandledRejection', (reason, promise) => {
    const errorMessage =
      reason instanceof Error ? `${reason.message}\n${reason.stack || ''}` : String(reason);
    handleErrorAndReconnect(
      getState,
      `UnhandledRejection\nPromise: ${promise}`,
      errorMessage,
      restartFn
    );
  });

  // SIGTERM: 終了シグナル (graceful shutdown)
  process.on('SIGTERM', () => {
    safeLog(getState(), '[signal] SIGTERM received, shutting down gracefully...');
    shutdownFn();
  });

  // SIGHUP: ハングアップシグナル (通常は再起動)
  process.on('SIGHUP', () => {
    safeLog(getState(), '[signal] SIGHUP received, restarting...');
    restartFn().catch((err) => {
      console.error('[error] Failed to restart on SIGHUP:', err);
      process.exit(1);
    });
  });

  // warning: Node.jsの警告
  process.on('warning', (warning) => {
    safeLog(getState(), `[warning] ${warning.name}: ${warning.message}`, 'warn');
    if (warning.stack) {
      safeLog(getState(), `[warning] Stack: ${warning.stack}`, 'warn');
    }
  });
}

/**
 * アプリケーションを作成
 */
export function createApplication(env: Env) {
  const state: ApplicationState = {
    bot: undefined,
    readline: undefined,
  };

  const getState = (): ApplicationState => state;

  /**
   * アプリケーション起動
   */
  async function start(): Promise<void> {
    const { bot, readline } = await startBot(env);
    state.bot = bot;
    state.readline = readline;
  }

  /**
   * アプリケーション再起動
   */
  async function restart(): Promise<void> {
    state.readline?.close();
    const { bot, readline } = await startBot(env);
    state.bot = bot;
    state.readline = readline;
  }

  /**
   * アプリケーション停止
   */
  function shutdown(): void {
    if (state.bot) {
      state.bot.client.quit();
    }
    if (state.readline) {
      state.readline.close();
    }
    process.exit(0);
  }

  // エラーハンドラーをセットアップ
  setupErrorHandlers(getState, restart, shutdown);

  return {
    start,
    restart,
    shutdown,
  };
}
