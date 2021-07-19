module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/(\w*)\s+(.*)/)) {
      const mode = RegExp.$1;
      const text = RegExp.$2;

      if (mode.match(/(google|sksim|ggl)/)) {
        const url = `https://www.google.co.jp/search?q=${text}`;
        bot.safechat(url, 1000);
      }
  
      if (mode.match(/(image|img)/)) {
        const url = `https://www.google.co.jp/search?tbm=isch&q=${text}`;
        bot.safechat(url, 1000);
      }
    }

  });
}