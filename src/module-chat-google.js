module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/^(google|sksim|ggl)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
        const url = `https://www.google.co.jp/search?q=${RegExp.$2}`;
        bot.safechat(url, 1000);
    }

    if (message.match(/^(image|img)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const url = `https://www.google.co.jp/search?tbm=isch&q=${RegExp.$2}`;
      bot.safechat(url, 1000);
    }

    if (message.match(/^(map|地図)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      const url = `https://www.google.co.jp/maps?q=${RegExp.$2}`;
      bot.safechat(url, 1000);
    }

  });
}