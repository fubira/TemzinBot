module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (bot.username === username) return;

    if (message.match(/^(http|https):\/\//)) {
      bot.safechat(`URL: ${message}` , 500);
    }
  });
}