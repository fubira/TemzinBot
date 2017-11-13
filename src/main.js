const readline = require('readline');
const delay = require('delay');

var mineflayer = require('mineflayer');
require('dotenv').config();

console.log('Connecting to [' + process.env.MC_HOST +':' + process.env.MC_PORT + ']');
console.log('User [' + process.env.MC_USERNAME + ']');

var bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: process.env.MC_USERNAME,
  password: process.env.MC_PASSWORD,
  verbose: true
});

bot.on('connect', () => {
  console.log("[bot.connect] connected.");
});

bot.on('chat', (username, message, translate, jsonMsg, matches) => {
  console.log('[bot.chat] <' + username + '>: ' + message);
});

bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
  console.log('[bot.whisper] <' + username + '>: ' + message);
  bot.chat(message);
});

bot.on('message', (jmes) => {
  var message = jmes_to_text(jmes);
  console.log('[bot.message] ' + message);
});

bot.on('end', () => {
  console.log('[bot.end] ');
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout});
rl.setPrompt('> ');
rl.on('line', (line) => {
  bot.chat(line);
})
rl.on('close', () => {
  bot.chat('bye');
  delay(1000).then(() => {
    bot.quit();
  })
})


function jmes_to_text(jmes) {
  var message = '';
  if (jmes.text)
    message = jmes.text;

  if (jmes.extra)
    jmes.extra.forEach((v, i, a) => {
        message += v.text;
      });
  return message;
}

function safe_chat(text) {

}