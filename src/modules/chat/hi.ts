import type * as Mineflayer from 'mineflayer';
import type { BotInstance } from '@/core';
import { CONSTANTS } from '@/config';
import { onUserChat } from '@/utils';

/**
 * 挨拶パターン定義
 */
const GREETING_PATTERNS = [
  { regex: /^(?:hi|hai|ひ|日|はい|へ)$/, response: 'hi' },
  { regex: /^(?:わんへ|わんっ|wannhe)/, response: 'わんへ' },
  { regex: /^(?:こん|kon)$/, response: 'こん' },
] as const;

export function hiModule(bot: BotInstance) {
  let lastJoinedPlayer: string | undefined;

  /**
   * 自分が login したときに挨拶する
   */
  bot.client.once('login', () => {
    bot.chat.send('hi', { delay: CONSTANTS.CHAT_DELAY.GREETING });
  });

  /**
   * 最後に入ってきた人の挨拶に応答する
   */
  bot.client.on('playerJoined', (player: Mineflayer.Player) => {
    lastJoinedPlayer = player.username;
  });

  onUserChat(bot, (username, message) => {
    if (username !== lastJoinedPlayer) {
      return;
    }

    // パターンマッチングで応答
    const matched = GREETING_PATTERNS.find((p) => message.match(p.regex));
    if (matched) {
      bot.chat.send(matched.response, { delay: CONSTANTS.CHAT_DELAY.GREETING });
    }

    lastJoinedPlayer = undefined;
  });
};
