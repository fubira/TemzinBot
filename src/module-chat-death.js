module.exports = function(bot) {
  var is_dead = false;

  bot.on('death', () => {
    is_dead = true;
  });

  bot.on('spawn', () => {
    if (!is_dead) return;

    bot.randomchat(['ギエピー', '死ぬかと思った', '致命傷ですんだ', 'あやうく死ぬところだった']);
    is_dead = false;
  });
}