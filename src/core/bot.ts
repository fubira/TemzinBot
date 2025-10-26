import type * as Readline from 'node:readline';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as Mineflayer from 'mineflayer';
import type { ChatMessage } from 'prismarine-chat';
import { CONSTANTS } from '@/config';
import type { TemzinBotModule, TemzinBotOpts } from './types';

dayjs.extend(utc);

export class TemzinBot {
  public instance!: Mineflayer.Bot;
  private readline!: Readline.Interface;
  public hasInterrupt: boolean;

  private safechat_send_text_cache: string[] = [];
  private safechat_last_send_time: number = Date.now();
  private safechat_continuous_count = 0;

  constructor() {
    this.hasInterrupt = false;
  }

  /**
   * Botインスタンスの初期化
   */
  public createBot({ ...opts }: TemzinBotOpts, readline: Readline.Interface) {
    if (this.instance) {
      console.log(`Bot [${this.instance.username}] is active.`);
    }
    console.log(opts);

    this.instance = Mineflayer.createBot({ ...opts });
    this.readline = readline;

    console.log(`Connecting to [${opts.host}:${opts.port}] (${this.instance.version})`);

    this.setupEventHandlers(opts);
  }

  /**
   * 基本的なイベントハンドラーのセットアップ
   */
  private setupEventHandlers(opts: TemzinBotOpts) {
    this.instance.on('login', () => {
      this.log(`[bot.login] ${this.instance.username}`);
      opts.onLogin?.();
    });

    this.instance.on('end', (reason: string) => {
      this.log(`[bot.end] reason: ${reason}`);
    });

    this.instance.on('message', (jmes: ChatMessage) => {
      this.log(jmes.toAnsi());
    });

    this.instance.on('kicked', (reason: string) => {
      this.log(`[bot.kicked] reason: ${reason}`);
    });

    this.instance.on('death', () => {
      const userName = this.instance.username;
      const position = this.instance.player.entity.position;
      this.log(`[bot.death] user ${userName} dead at ${position}.`);
    });

    this.instance.on('error', (err) => {
      this.log('[bot.error]', err);
    });
  }

  /**
   * Readline処理を含むログ出力
   */
  public log(...args: unknown[]) {
    const Readline = require('node:readline');
    Readline.cursorTo(process.stdout, 0);

    if (typeof args[0] === 'string') {
      args[0] = `[${dayjs.utc().local().format('YYYY-MM-DD HH:mm:ss')}] ${args[0]}`;
    }

    console.log(...args);

    if (this.readline) {
      this.readline.prompt(true);
    }
  }

  /**
   * チャットパターンの設定
   */
  public setChatPattern(patterns: { name: string; regexp: RegExp }[]) {
    if (this.instance) {
      patterns.forEach((p) => {
        this.instance.addChatPattern(p.name, p.regexp);
      });
    }
  }

  /**
   * 同じメッセージのループ送信、短時間での大量送信などを
   * 防ぐ仕組みを入れたチャット送信メソッド
   */
  private safechatText(text: string) {
    const current_time = Date.now();
    const elapsed_ms = current_time - this.safechat_last_send_time;

    if (!text) {
      return;
    }

    if (elapsed_ms > CONSTANTS.SAFECHAT_RESET_INTERVAL_MS) {
      this.safechat_continuous_count = 0;
    }

    this.safechat_continuous_count++;
    if (this.safechat_continuous_count > CONSTANTS.SAFECHAT_MAX_CONTINUOUS) {
      this.log('[bot.safechat] *REJECTED* 短時間での大量メッセージが送信がされました');
      return;
    }

    if (elapsed_ms > CONSTANTS.SAFECHAT_CACHE_CLEAR_MS) {
      this.safechat_send_text_cache = [];
    }

    if (this.safechat_send_text_cache.find((value) => value === text)) {
      this.log(`[bot.safechat] *REJECTED* 一定時間内に同一の文章が複数回送信されました: ${text}`);
      return;
    }

    this.safechat_send_text_cache.push(text);
    this.safechat_last_send_time = current_time;

    const lines = text.split(/\n/);

    lines.forEach((line, index) => {
      const wait =
        index * CONSTANTS.SAFECHAT_LINE_DELAY_MS +
        Math.floor(index / 5) * CONSTANTS.SAFECHAT_BATCH_DELAY_MS;
      setTimeout(() => {
        this.instance.chat(line);
      }, wait);
    });
  }

  public safechat(text: string, msec: number = CONSTANTS.SAFECHAT_DEFAULT_DELAY_MS) {
    setTimeout(() => {
      this.safechatText(text);
    }, msec);
  }

  public randomchat(messages: string[], msec: number = CONSTANTS.SAFECHAT_DEFAULT_DELAY_MS) {
    if (Array.isArray(messages) && messages.length > 0) {
      const message = messages[Math.floor(Math.random() * messages.length)];
      if (message) {
        setTimeout(() => {
          this.safechatText(message);
        }, msec);
      }
    }
  }

  public async loadModule(module: TemzinBotModule) {
    try {
      await module(this);
    } catch {
      this.log(`[bot.error] module ${module.name} load failed.`);
    }
  }
}

export default TemzinBot;
