require('dotenv').config();
const delay = require('delay');
const mineflayer = require('mineflayer');

function start() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: process.env.MC_PORT,
    username: process.env.MC_USERNAME,
    password: process.env.MC_PASSWORD,
    version: process.env.MC_VERSION || '1.19',
    auth: process.env.MC_AUTH || 'mojang',
    verbose: true
  });

  console.log('Connecting to [' + process.env.MC_HOST + ':' + process.env.MC_PORT + '] (' + bot.version + ')');

  // bot.loadPlugin(pathfinder);

  require('./src/bot-extension')(bot);

  function chatAddPattern(bot) {
    // kenmomine.club向けchat/whisperパターン
    try {
      bot.addChatPattern('chat', /^(?:\[[^\]]*\])<([^ :]*)> (.*)$/);
      bot.addChatPattern('whisper', /^([^ ]*) whispers: (.*)$/);
    } catch (e) {
      console.log('[bot.error] ' + e);
    }
  }

  bot.on('end', () => {
    bot.log('[bot.end]');
    if (bot.hasInterrupt) {
      process.exit(0);
    } else {
      // 自分で止めた時以外は再起動を試みる
      bot.log('[bot.end] Trying reconnection 1 min later...');
      delay(60000).then(() => { start(); });
    }
  });

  bot.on('connect', () => {
    bot.log('[bot.connect] user: [' + bot.username + ']');

    chatAddPattern(bot);

    // モジュール化された機能を読み込む
    // require('./src/module-action-move')(bot);
    // require('./src/module-action-follow')(bot);
    require('./src/module-logger')(bot);
    // require('./src/module-chat-hage')(bot);
    require('./src/module-chat-hi')(bot);
    require('./src/module-chat-answer')(bot);
    require('./src/module-chat-url-repeat')(bot);
    // require('./src/module-chat-kiyoshi')(bot);
    require('./src/module-chat-death')(bot);
    require('./src/module-chat-countdown')(bot);
    require('./src/module-data-record')(bot);
    require('./src/module-update')(bot);
    require('./src/module-help')(bot);
    require('./src/module-chat-weather')(bot);
    require('./src/module-chat-google')(bot);
    // require('./src/module-whisper-broadcast')(bot);
  });

  bot.on('error', err => console.log(err));
}

process.on('uncaughtException', (err) => {
  console.log('[process.uncaughtException] ' + err);
  // bot.log('[process.uncaughtException] Trying reconnection 1 min later...');
  // delay(60000).then(() => { start(); });
});

try {
  start();
} catch(e) {
  console.error(e);
}
