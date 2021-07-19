module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/(^|\()(google|sksim|ggl)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      if (keyword) {
        bot.safechat(`https://www.google.co.jp/search?q=${keyword}`, 1000);
      }
    }

    if (message.match(/(^|\()(image|img)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      if (keyword) {
        bot.safechat(`https://www.google.co.jp/search?tbm=isch&q=${keyword}`, 1000);
      }
    }

    if (message.match(/(^|\()(map|地図)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const keyword = RegExp.$3;
      if (keyword) {
        bot.safechat(`https://www.google.co.jp/maps?q=${keyword}`, 1000);
      }
    }

  });
}