import type { TemzinBot } from '@/core';

export default (bot: TemzinBot) => {
  bot.instance.on('chat', (username, message) => {
    if (username === bot.instance.username) return;

    const match = message.match(/^カウント/);

    if (match && match[1] === bot.instance.username) {
      bot.safechat('カウントダウンしますぽん！', 500);
      bot.safechat('> 3', 3000);
      bot.safechat('> 2', 4000);
      bot.safechat('> 1', 5000);
      bot.safechat('> GO!', 6000);
    }
  });
};
