/**
 * Bot インスタンス作成
 * クラスベースから関数型に変換
 */

import * as Readline from 'node:readline';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as Mineflayer from 'mineflayer';
import type { ChatMessage } from 'prismarine-chat';
import { CONSTANTS } from '@/config';
import type { BotConfig, BotInstance, BotModule } from './types';

dayjs.extend(utc);

/**
 * ログ関数を作成
 */
function createLogger(readline: Readline.Interface) {
  return (...args: unknown[]) => {
    Readline.cursorTo(process.stdout, 0);

    if (typeof args[0] === 'string') {
      args[0] = `[${dayjs.utc().local().format('YYYY-MM-DD HH:mm:ss')}] ${args[0]}`;
    }

    console.log(...args);

    if (readline) {
      readline.prompt(true);
    }
  };
}

/**
 * チャット送信状態
 */
interface ChatState {
  sendTextCache: string[];
  lastSendTime: number;
  continuousCount: number;
}

/**
 * 安全なチャット送信機能を作成
 */
function createChatSender(bot: Mineflayer.Bot, log: (...args: unknown[]) => void) {
  const state: ChatState = {
    sendTextCache: [],
    lastSendTime: Date.now(),
    continuousCount: 0,
  };

  function safechatText(text: string): void {
    const currentTime = Date.now();
    const elapsedMs = currentTime - state.lastSendTime;

    if (!text) {
      return;
    }
    // 連続送信カウントのリセット
    if (elapsedMs > CONSTANTS.SAFECHAT_RESET_INTERVAL_MS) {
      state.continuousCount = 0;
    }

    state.continuousCount++;
    if (state.continuousCount > CONSTANTS.SAFECHAT_MAX_CONTINUOUS) {
      log('[bot.safechat] *REJECTED* 短時間での大量メッセージが送信がされました');
      return;
    }
    // キャッシュのクリア
    if (elapsedMs > CONSTANTS.SAFECHAT_CACHE_CLEAR_MS) {
      state.sendTextCache = [];
    }

    // 重複チェック
    if (state.sendTextCache.find((value) => value === text)) {
      log(`[bot.safechat] *REJECTED* 一定時間内に同一の文章が複数回送信されました: ${text}`);
      return;
    }

    state.sendTextCache.push(text);
    state.lastSendTime = currentTime;

    // 複数行対応
    const lines = text.split(/\n/);
    lines.forEach((line, index) => {
      const wait =
        index * CONSTANTS.SAFECHAT_LINE_DELAY_MS +
        Math.floor(index / 5) * CONSTANTS.SAFECHAT_BATCH_DELAY_MS;
      setTimeout(() => {
        bot.chat(line);
      }, wait);
    });
  }

  return {
    send: (text: string, options?: { delay?: number }) => {
      const delay = options?.delay ?? CONSTANTS.SAFECHAT_DEFAULT_DELAY_MS;
      setTimeout(() => {
        safechatText(text);
      }, delay);
    },
    random: (messages: string[], options?: { delay?: number }) => {
      if (!Array.isArray(messages) || messages.length === 0) {
        return;
      }

      const message = messages[Math.floor(Math.random() * messages.length)];
      if (!message) {
        return;
      }

      const delay = options?.delay ?? CONSTANTS.SAFECHAT_DEFAULT_DELAY_MS;
      setTimeout(() => {
        safechatText(message);
      }, delay);
    },
  };
}

/**
 * Bot インスタンスを作成
 */
export function createBot(
  config: BotConfig,
  readline: Readline.Interface
): BotInstance {
  const bot = Mineflayer.createBot({ ...config });
  const log = createLogger(readline);
  const chat = createChatSender(bot, log);

  // 中断フラグ（クロージャで管理）
  let hasInterrupt = false;

  console.log(`Connecting to [${config.host}:${config.port}] (${bot.version})`);

  // 基本的なイベントハンドラーのセットアップ
  bot.on('login', () => {
    log(`[bot.login] ${bot.username}`);
    config.onLogin?.();
  });

  bot.on('end', (reason: string) => {
    log(`[bot.end] reason: ${reason}`);
  });

  bot.on('message', (jmes: ChatMessage) => {
    log(jmes.toAnsi());
  });

  bot.on('kicked', (reason: string) => {
    log(`[bot.kicked] reason: ${reason}`);
  });

  bot.on('death', () => {
    const position = bot.player.entity.position;
    log(`[bot.death] user ${bot.username} dead at ${position}.`);
  });

  bot.on('error', (err) => {
    log('[bot.error]', err);
  });

  // BotInstance インターフェイス実装
  return {
    client: bot,
    log,
    chat,
    setChatPattern: (patterns: { name: string; regexp: RegExp }[]) => {
      patterns.forEach((p) => {
        bot.addChatPattern(p.name, p.regexp);
      });
    },
    get hasInterrupt() {
      return hasInterrupt;
    },
    setInterrupt: (value: boolean) => {
      hasInterrupt = value;
    },
  };
}

/**
 * モジュールをロード
 */
export async function loadModule(
  botInstance: BotInstance,
  module: BotModule
): Promise<void> {
  try {
    await module(botInstance);
  } catch (error) {
    botInstance.log(`[bot.error] module ${module.name} load failed.`, error);
  }
}
