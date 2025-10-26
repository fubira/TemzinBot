import type { BotInstance } from '@/core';
import { CONSTANTS } from '@/config';
import { onUserChat } from '@/utils';

const COUNTDOWN_MESSAGES = [
  { text: 'カウントダウンしますぽん！', delay: CONSTANTS.CHAT_DELAY.QUICK },
  { text: '> 3', delay: 3000 },
  { text: '> 2', delay: 4000 },
  { text: '> 1', delay: 5000 },
  { text: '> GO!', delay: 6000 },
] as const;

export function countdownModule(bot: BotInstance) {
  onUserChat(bot, (_username, message) => {
    if (message.match(/^カウント/)) {
      COUNTDOWN_MESSAGES.forEach(({ text, delay }) => {
        bot.chat.send(text, { delay });
      });
    }
  });
};
