module.exports = function(bot) {
  bot.on('whisper', (username, message) => {
    bot.safechat(username + "さんが「" + message + "」って言ってるよ");
  });
}