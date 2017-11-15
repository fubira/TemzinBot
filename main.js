require('dotenv').config();
const delay = require('delay');
const jsonfile = require('jsonfile');
const mineflayer = require('mineflayer');
const navigate = require('mineflayer-navigate')(mineflayer);
const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: process.env.MC_USERNAME,
  password: process.env.MC_PASSWORD,
  verbose: true
});

require('./src/bot-extension')(bot);

console.log('Connecting to [' + process.env.MC_HOST +':' + process.env.MC_PORT + ']');
console.log('User [' + process.env.MC_USERNAME + ']');

function chatAddPattern(bot) {
  // kenmomine.club向けchat/whisperパターン
  bot.chatAddPattern(/^(?:\[[^\]]*\])<([^ :]*)> (.*)$/, 'chat', 'kenmomine.club chat');
  bot.chatAddPattern(/^([^ ]*) whispers: (.*)$/, 'whisper', 'kenmomine.club whisper(Chatco)');
}

bot.on('connect', () => {
  bot.log('<bot.connect>');
  chatAddPattern(bot);
  navigate(bot);

  // モジュール化された機能を読み込む
  require('./src/module-logger')(bot);
  require('./src/module-chat-hage')(bot);
  require('./src/module-chat-hi')(bot);
  // require('./src/module-chat-kiyoshi')(bot);
  require('./src/module-chat-death')(bot);
  // require('./src/module-data-record')(bot);
  require('./src/module-update')(bot);
  require('./src/module-navigate')(bot);
  require('./src/module-help')(bot);
  // require('./src/module-whisper-broadcast')(bot);

  // 入力を有効にする
  bot.init_readline();

  bot.on('end', () => {
    bot.log('<bot.end>');
    delay(1000).then(() => {
      process.exit(0);
    });
  });
});
