module.exports = function(bot) {
  var is_dead = false;

  bot.on('death', () => {
    is_dead = true;
  });

  bot.on('spawn', () => {
    if (is_dead)
    {
      is_dead = false;
      var messages = [ null, '死ぬかと思った', '致命傷ですんだ', 'あやうく死ぬところだった'];
      var choice = messages[Math.floor(Math.random() * messages.length)];

      if (choice)
        bot.safechat(choice);
    }
  });
}