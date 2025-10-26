import type { TemzinBot } from '@/core';

export default (bot: TemzinBot) => {
  bot.instance.on('chat', (username, message) => {
    console.log('chat', username, message);
    // if (username === bot.instance.username) return;

    const matchGoogle = message.match(/(^|\(\s*)(google|sksim|ggl)\s*[(]?([^()]*)[)]?/i);
    if (matchGoogle) {
      const [, text] = matchGoogle[0].split(' ');

      if (text) {
        const params = text.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?q=${params}`, 1000);
      }
    }

    const matchImage = message.match(/(^|\()(image|img)\s*[(]?([^()]*)[)]?/i);
    if (matchImage) {
      const [, text] = matchImage[0].split(' ');

      if (text) {
        const params = text.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?tbm=isch&q=${params}`, 1000);
      }
    }

    const matchMap = message.match(/(^|\()(map|地図)\s*[(]?([^()]*)[)]?/i);
    if (matchMap) {
      const [, text] = matchMap[0].split(' ');

      if (text) {
        const params = text.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/maps?q=${params}`, 1000);
      }
    }
  });
};
