/**
 * ユーティリティ関数
 */

import type { BotInstance } from '@/core';

/**
 * 指定時間待機するユーティリティ関数
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ユーザーのチャットメッセージのみを処理するヘルパー関数
 * 自分の発言は自動的にフィルタリングされる
 */
export function onUserChat(
  bot: BotInstance,
  handler: (username: string, message: string) => void | Promise<void>
): void {
  bot.client.on('chat', (username, message) => {
    if (username === bot.client.username) return;
    handler(username, message);
  });
}
