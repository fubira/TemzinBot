/**
 * アプリケーション全体で使用される定数定義
 */

export const CONSTANTS = {
  /** デフォルトのMinecraftバージョン */
  DEFAULT_MC_VERSION: '1.21.4',

  /** SIGINT受信後のタイムアウト (ms) */
  SIGINT_TIMEOUT_MS: 1000,

  /** 再接続遅延時間 (ms) */
  RECONNECTION_DELAY_MS: 60000,

  /** safechatのデフォルト遅延 (ms) */
  SAFECHAT_DEFAULT_DELAY_MS: 800,

  /** safechatの連続送信判定時間 (ms) */
  SAFECHAT_RESET_INTERVAL_MS: 1000,

  /** safechatのキャッシュクリア時間 (ms) */
  SAFECHAT_CACHE_CLEAR_MS: 3000,

  /** safechatの連続送信最大回数 */
  SAFECHAT_MAX_CONTINUOUS: 10,

  /** 1行ごとの送信遅延 (ms) */
  SAFECHAT_LINE_DELAY_MS: 2000,

  /** 5行ごとの追加遅延 (ms) */
  SAFECHAT_BATCH_DELAY_MS: 5000,

  /** モジュール別チャット遅延 (ms) */
  CHAT_DELAY: {
    /** 即座に送信 */
    IMMEDIATE: 0,
    /** 素早く送信 */
    QUICK: 500,
    /** 通常の遅延 */
    NORMAL: 1000,
    /** 挨拶などの遅延 */
    GREETING: 2000,
  },

  /** AIモジュール共通設定 */
  AI_DEFAULTS: {
    /** デフォルトシステムロール */
    SYSTEM_ROLE: 'あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。',
    /** デフォルトユーザーロールポストフィックス */
    USER_POSTFIX: '100～200文字程度にまとめて回答してください。',
  },
} as const;
