import type { BotInstance } from '@/core';

export function deathModule(bot: BotInstance) {
  let is_dead = false;

  bot.client.on('death', () => {
    is_dead = true;
  });

  bot.client.on('spawn', () => {
    if (!is_dead) {
      return;
    }

    bot.chat.random(['ギエピー', '死ぬかと思った', '致命傷ですんだ', 'あやうく死ぬところだった']);
    is_dead = false;
  });
};
