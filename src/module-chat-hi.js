module.exports = function(bot) {
  // 自分が入ったときの挨拶
  bot.once('login', () => {
    // bot.safechat('hi', 2000);
  });

  // 最後に入ってきた人の hi に応答
  this.last_joined_player = null;

  bot.on('playerJoined', (player) => {
    this.last_joined_player = player.username;
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (username === this.last_joined_player) {
      if (message.match(/^hi|hai|ひ|日|はい|へ/))
        bot.safechat('hi', 2000);
      if (message.match(/^わんへ|wannhe/))
        bot.safechat('わんへ', 2000);
      if (message.match(/^(?:こん|kon$)/))
        bot.safechat('こん', 2000);

      this.last_joined_player = null;
    }
  })
}