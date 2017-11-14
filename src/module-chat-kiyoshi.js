module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (bot.username === username)
      return;

    if (message.match(/^きよし$/)) {
      bot.safechat('フォン');
    }
    if (message.match(/^kiyoshi$/)) {
      bot.safechat('fone');
    }
  });
}