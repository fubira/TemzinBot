module.exports = function(bot) {
    
  bot.on('chat', (username, message) => {
    if (username === bot.username)
      return;

    var target = bot.players[username].entity;

    if (message === 'temzinおいで') {
      bot.log('[navigate] to: ' + target.position);
      bot.navigate.to(target.position);
    }

    if (message === 'temzinとまれ') {
      bot.log('[navigate] stop');
      bot.navigate.stop();
    }
  });

  bot.navigate.on('cannotFind', (closestPath) => {
      bot.chat("むり");
      bot.navigate.walk(closestPath);
  })
}
