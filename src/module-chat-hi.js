module.exports = function(bot) {
  // 自分が入ったときの挨拶
  bot.once('login', () => {
    bot.safechat('hi', 2000);
  });

  // 最後に入ってきた人の hi に応答
  this.last_joined_player = null;

  bot.on('playerJoined', (player) => {
    this.last_joined_player = player;
  });

  bot.on('chat', (username, message) => {
    if (username !== bot.username && username === this.last_joined_player) {
      bot.safechat('hi', 2000);
    }

    this.last_joined_player = null;
  })
}