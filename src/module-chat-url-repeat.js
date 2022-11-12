module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (bot.username === username) return;

    if (message.match(/(http|https):\/\//)) {
      bot.safechat('URLを復唱します: ' + message, 500);
    }
  });
}