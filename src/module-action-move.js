module.exports = function(bot) {
    
  bot.on('chat', (username, message) => {
    if (username === bot.username)
      return;

    var target = bot.players[username].entity;
    if (message.match(/(\w*)\W*(?:おいで|カモン|(?:こっち|ここ)(?:こい|来い|きて|来て)?)/) && RegExp.$1 === bot.username) {
      bot.log('[bot.navigate] to: ' + target.position);
      bot.navigate.to(target.position);
    }
    if (message.match(/(\w*)\W*(?:とまれ|ストップ|停止)/) && RegExp.$1 === bot.username) {
      bot.log('[bot.navigate] stop');
      bot.navigate.stop();
    }
  });

  bot.navigate.on('cannotFind', (closestPath) => {
      bot.randomchat(['むりだわ',　'むりじゃね', 'いけない'], 1500);
      bot.navigate.walk(closestPath);
  })
}
