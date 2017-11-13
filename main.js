require('dotenv').config();
const delay = require('delay');
const readline = require('readline');

console.log('Connecting to [' + process.env.MC_HOST +':' + process.env.MC_PORT + ']');
console.log('User [' + process.env.MC_USERNAME + ']');

const mineflayer = require('mineflayer');
const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: process.env.MC_USERNAME,
  password: process.env.MC_PASSWORD,
  verbose: true
});
const extension = require('./src/bot-extension')(bot);

bot.on('connect', () => {
  console.log("[bot.connect] connected.");
  setup_readline();

  bot.chatAddPattern(/^(?:\[[^\]]*\])?<([^ :]*)> (.*)$/, 'chat', 'kenmomine.biz chat');
  bot.chatAddPattern(/^([^ ]*) whispers: (.*)$/, 'whisper', 'ChatCo whisper');
});

bot.on('chat', (username, message, translate, jsonMsg, matches) => {
  // console.log('[bot.chat] <' + username + '>: ' + message);
});

bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
  console.log('[bot.whisper] <' + username + '>: ' + message);
  bot.safechat(username + "さんが" + message + "って言ってるよ");
});

bot.on('message', (jmes) => {
  var message = bot.jmes_to_text(jmes);
  console.log('[bot.message] ' + message);
});

bot.on('kicked', (reason, loggedIn) => {
  console.log('[bot.kicked] reason: ' + reason);
});

bot.on('end', () => {
  console.log('[bot.end]');
  delay(1000).then(() => {
    process.exit(0);
  })
});

function parse_message(message) {
}

function setup_readline() {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  rl.setPrompt('> ');
  rl.on('line', (line) => {
    // STDINからの入力はBOTにそのまま流す
    bot.chat(line);
    rl.prompt();
  })
  
  rl.on('close', () => {
    // CTRL+DまたはCTRL+CでSTDINが閉じたらbotも閉じる
    bot.safechat('bye.');
    delay(1000).then(() => {
      bot.quit();
    })
  })
}
