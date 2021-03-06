module.exports = function(bot) {
  /*
  bot.on('chat', (username, message) => {
    if (bot.username === username) return;

    if (message.match(/BOT|ボット/)) {
      bot.randomchat(['ぼくぼっとです。', 'BOTですが何か？', 'BOTじゃないよアンドロイドだよ']);
    }
  });
  */

  bot.on('whisper', (username, message) => {
    if (bot.username === username) return;

    if (message.match(/^(?:h|help|HELP|ヘルプ)/))
    {
      bot.safechat('/tell ' + username + ' ぼくはぼっとです。 (https://github.com/fubira/TemzinBot)');
      bot.safechat('/tell ' + username + ' === WHISPER COMMAND ===');
      bot.safechat('/tell ' + username + ' 記憶一覧: /tell ' + bot.username + ' 記憶');
      bot.safechat('/tell ' + username + ' 記憶追加: /tell ' + bot.username + ' 記憶|覚える|保存 <key> <value>');
      bot.safechat('/tell ' + username + ' 記憶削除: /tell ' + bot.username + ' 削除|忘れる|消去 <key>');
    }
  });
}