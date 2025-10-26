import type { BotInstance } from '@/core';
import { CONSTANTS } from '@/config';
import { onUserChat } from '@/utils';

export function urlRepeatModule(bot: BotInstance) {
  onUserChat(bot, (_username, message) => {
    if (message.match(/^(http|https):\/\//)) {
      bot.chat.send(`URL: ${message}`, { delay: CONSTANTS.CHAT_DELAY.QUICK });
    }
  });
};
