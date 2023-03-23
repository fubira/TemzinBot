import dayjs from 'dayjs';
import delay from 'delay';
import * as Readline from 'readline';
import * as Mineflayer from 'mineflayer';
import { ChatMessage } from 'prismarine-chat';

export interface TemzinBotOpts {
  host: string;
  port: number;
  username: string;
  password: string;
  version: string;
  auth: 'mojang' | 'microsoft' | 'offline' | undefined;
}

export type TemzinBotModule = (temzinBot: TemzinBot) => Promise<void> | void;

export class TemzinBot {
  public instance: Mineflayer.Bot;
  private readline: Readline.Interface;
  public hasInterrupt: boolean;

  constructor() {
    this.instance = undefined;
    this.readline = undefined;
    this.hasInterrupt = false;
  }

  /**
   * Json messageの文言のみ抽出して文字列を返す
   * @param jmes
   * @returns
   */
  private jmesToText(jmes: any): string {
    let message = '';
    if (jmes.text) message += jmes.text;

    if (jmes.extra)
      jmes.extra.forEach((v: any) => {
        message += v.text;
      });
    return message;
  }

  /**
   * Botインスタンスの初期化
   * @param opts
   */
  public createBot({ ...opts }: TemzinBotOpts, readline: Readline.Interface) {
    if (this.instance) {
      console.log(`Bot [${this.instance.username}] is active.`);
    }

    this.instance = Mineflayer.createBot({ ...opts });
    this.readline = readline;

    console.log(
      `Connecting to [${opts.host}:${opts.port}] (${this.instance.version})`
    );

    /**
     * 基本的なイベントの処理
     */
    this.instance.on('login', () => {
      this.log('[bot.login]');
    });

    this.instance.on('end', (reason: any) => {
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
   * @param args
   */
  public log(...args: any[]) {
    Readline.cursorTo(process.stdout, 0);

    if (typeof args[0] === 'string') {
      args[0] = '[' + dayjs().toDate().toLocaleString() + '] ' + args[0];
    }

    console.log(...args);

    if (this.readline) {
      this.readline.prompt(true);
    }
  }

  /**
   * チャットパターン
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
  private safechat_send_text_cache: string[] = [];
  private safechat_last_send_time: number = new Date().getTime();
  private safechat_continuous_count = 0;

  private safechatText(text: string) {
    const current_time = new Date().getTime();
    const elapsed_ms = current_time - this.safechat_last_send_time;

    if (!text) {
      return;
    }

    if (elapsed_ms > 1000) {
      this.safechat_continuous_count = 0;
    }

    this.safechat_continuous_count++;
    if (this.safechat_continuous_count > 10) {
      this.log(
        '[bot.safechat] *REJECTED* 短時間での大量メッセージが送信がされました'
      );
      return;
    }

    if (elapsed_ms > 3000) {
      // 一定時間経過したら直前のメッセージは忘れる
      this.safechat_send_text_cache = [];
    }

    if (
      this.safechat_send_text_cache.find((value) => {
        return value === text;
      })
    ) {
      this.log(
        '[bot.safechat] *REJECTED* 一定時間内に同一の文章が複数回送信されました: ' +
          text
      );
      return;
    }

    this.safechat_send_text_cache.push(text);
    this.safechat_last_send_time = current_time;

    /**
     * 改行コードが入っている場合、1行ごとに時間を空けて発言する
     */
    const lines = text.split(/\n/);

    lines.forEach((line, index) => {
      // 1行ごとに2秒 + 5行ごとに5秒
      const wait = (index * 2000 + (index / 5) * 5000);
      delay(wait).then(() => {
        this.instance.chat(line);
      });
    })
  }

  public safechat(text: string, msec = 800) {
    delay(msec).then(async () => {
      this.safechatText(text);
    });
  }

  public randomchat(messages: string[], msec = 800) {
    let message: string;

    if (Array.isArray(messages)) {
      message = messages[Math.floor(Math.random() * messages.length)];
    } else {
      message = messages;
    }

    delay(msec).then(() => {
      this.safechatText(message);
    });
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
