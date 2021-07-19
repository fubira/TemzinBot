module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message.match(/(\w*)\W*(?:カウントダウン)/) && RegExp.$1 === bot.username) {
      bot.safechat('カウントダウンしまーす', 500);
      bot.safechat('> 3', 3000);
      bot.safechat('> 2', 4000);
      bot.safechat('> 1', 5000);
      bot.safechat('> GO!', 6000);
    }
  })
}