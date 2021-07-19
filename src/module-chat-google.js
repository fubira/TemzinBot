module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/\(?(\w+)\s+(\W+)\)?/)) {
      console.log(RegExp.$1, RegExp.$2);
      const mode = RegExp.$1.replace(/[\(\)]/g, '');
      const text = RegExp.$2.replace(/[\(\)]/g, '');
      console.log({mode, text});

      if (mode.match(/(google|sksim|ggl|ごおｇｌ絵)/g)) {
        const url = `https://www.google.co.jp/search?q=${text}`;
        bot.safechat(url, 1000);
      }
  
      if (mode.match(/(image|img|今げ)/g)) {
        const url = `https://www.google.co.jp/search?tbm=isch&q=${text}`;
        bot.safechat(url, 1000);
      }
  
      if (mode.match(/(map|まｐ|マップ|地図)/g)) {
        const url = `https://www.google.co.jp/maps?q=${text}`;
        bot.safechat(url, 1000);
      }
    }

  });
}