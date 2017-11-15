module.exports = function(bot) {
  bot.on('chat', (username, message, translate, jsonMsg, matches) => {
    // bot.log('[chat] <' + username + '>: ' + message);
  });

  bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
    // bot.log('[whisper] <' + username + '>: ' + message);
  });

  bot.on('message', (jmes) => {
    bot.log(bot.jmes_to_text(jmes));
  });

  bot.on('kicked', (reason, loggedIn) => {
    bot.log('[bot.kicked] reason: ' + reason);
  });

  bot.on('death', () => {
    bot.log('[bot.death] ' + bot.username + ' dead at ' + bot.position + '.');
  });
}