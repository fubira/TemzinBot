module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/(^|\()(google|sksim|ggl)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      console.log(keyword);
      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?q=${params}`, 1000);
      }
    }

    if (message.match(/(^|\()(image|img)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/search?tbm=isch&q=${params}`, 1000);
      }
    }

    if (message.match(/(^|\()(map|地図)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      if (keyword) {
        const params = keyword.replace(/\s+/gi, '+');
        bot.safechat(`https://www.google.co.jp/maps?q=${params}`, 1000);
      }
    }

  });
}