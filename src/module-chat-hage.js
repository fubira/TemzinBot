module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (bot.username === username)
      return;

    if (message.match(/^毛根|もうこん/))
      bot.safechat('また髪の話してる');

    if (message.match(/(\w*)(?:は|の|is|って)?(?:ハゲ|はげ|禿|hage)/) && RegExp.$1 === bot.username) {
      var answers = [ null, 'ハ、ハゲちゃうわ！', 'はげてないよ？', 'むしろ' + username + 'がハゲ'];
      var choice = answers[Math.floor(Math.random() * answers.length)];

      if (choice)
        bot.safechat(choice);
    }
  });
}