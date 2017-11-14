module.exports = function(bot) {
  bot.once('login', () => {
    bot.safechat('hi', 2000);
  });
}