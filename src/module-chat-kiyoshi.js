module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (message.match(/^きよし$/)) {
      bot.safechat('フォン');
    }
    if (message.match(/^kiyoshi$/)) {
      bot.safechat('fone');
    }
  });
}