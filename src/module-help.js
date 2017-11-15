module.exports = function(bot) {
  bot.on('whisper', (username, message) => {
    if (bot.username === username) return;

    bot.safechat('/tell ' + username + ' ぼくはぼっとです。');
  });
}