import { TemzinBot } from '..';

export default (bot: TemzinBot) => {
  bot.instance.on('chat', (username, message) => {
    if (username === bot.instance.username) return;

    const matchGoogle = message.match(/(^|\()(google|sksim|ggl)\s*[(]?([^()]*)[)]?/gi);
    if (matchGoogle) {
      const keyword = matchGoogle[3];

      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?q=${params}`, 1000);
      }
    }

    const matchImage = message.match(/(^|\()(image|img)\s*[(]?([^()]*)[)]?/gi);
    if (matchImage) {
      const keyword = matchImage[3];

      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?tbm=isch&q=${params}`, 1000);
      }
    }

    const matchMap = message.match(/(^|\()(map|地図)\s*[(]?([^()]*)[)]?/gi);
    if (matchMap) {
      const keyword = matchMap[3];

      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/maps?q=${params}`, 1000);
      }
    }
  });
}
