import type { TemzinBot } from '@/core';

export default (bot: TemzinBot) => {
  bot.instance.on('chat', (username, message) => {
    if (bot.instance.username === username) return;

    if (message.match(/^(http|https):\/\//)) {
      bot.safechat(`URL: ${message}`, 500);
    }
  });
};
