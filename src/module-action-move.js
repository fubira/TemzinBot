const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

module.exports = function(bot) {
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  defaultMove.allowFreeMotion = true;

  bot.on('chat', (username, message) => {
    if (!bot.players[username]) {
      return;
    }
    if (username === bot.username) {
      return;
    }

    var target = bot.players[username].entity;
      if (message.match(/(\w*)\W*(?:おいで|カモン|(?:こっち|ここ)(?:こい|来い|きて|来て)?)/) && RegExp.$1 === bot.username) {
        if (target)
        {
          bot.log('[bot.navigate] to: ' + target.position);
          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(target.position.x, target.position.y, target.position.z);
        } else {
          bot.randomchat(['むりだわ',　'むりじゃね', 'いけない'], 1000);
        }
      }
      if (message.match(/(\w*)\W*(?:とまれ|ストップ|停止)/) && RegExp.$1 === bot.username) {
        bot.log('[bot.navigate] stop');
        bot.pathfinder.setGoal(null);
      }
  });

  /*
  bot.navigate.on('cannotFind', (closestPath) => {
    // bot.randomchat(['うーん',　'途中までなら'], 1000);
    bot.log('[bot.navigate] cannotFind');
    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalNear(closestPath)).navigate.walk(closestPath);
  })
  */
}
