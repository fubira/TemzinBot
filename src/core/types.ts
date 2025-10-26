/**
 * コア型定義
 */

import type * as Mineflayer from 'mineflayer';

/**
 * Bot接続設定
 */
export interface BotConfig {
  host: string;
  port: number;
  username: string;
  version: string;
  auth: 'mojang' | 'microsoft' | 'offline' | undefined;
  onLogin?: () => void;
}

/**
 * ログ関数型
 */
export type Logger = (...args: unknown[]) => void;

/**
 * チャット送信制御オプション
 */
export interface ChatOptions {
  delay?: number;
}

/**
 * チャット送信関数型
 */
export interface ChatSender {
  /**
   * 安全なチャット送信（重複・連続送信を防止）
   */
  send: (text: string, options?: ChatOptions) => void;

  /**
   * ランダムなメッセージを送信
   */
  random: (messages: string[], options?: ChatOptions) => void;
}

/**
 * Botインスタンス集約型
 */
export interface BotInstance {
  /**
   * Mineflayer Bot インスタンス
   */
  client: Mineflayer.Bot;

  /**
   * ログ出力関数
   */
  log: Logger;

  /**
   * チャット送信関数
   */
  chat: ChatSender;

  /**
   * チャットパターン設定関数
   */
  setChatPattern: (patterns: { name: string; regexp: RegExp }[]) => void;

  /**
   * 中断フラグ
   */
  hasInterrupt: boolean;

  /**
   * 中断フラグを設定
   */
  setInterrupt: (value: boolean) => void;
}

/**
 * Botモジュール型
 */
export type BotModule = (botInstance: BotInstance) => Promise<void> | void;
