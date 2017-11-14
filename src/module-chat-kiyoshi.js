module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (message.match(/^(きよし|kiyoshi)$/)) {
      bot.safechat('フォン');
    }
  });
}