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

bot.on('connect', function() {
  console.log("[bot.connect] connected.");
});

bot.on('chat', function(username, message, translate, jsonMsg, matches) {
  console.log('[bot.chat] <' + username + '>: ' + message);
});

bot.on('whisper', function(username, message, translate, jsonMsg, matches) {
  console.log('[bot.whisper] <' + username + '>: ' + message);
  bot.chat(message);
});

bot.on('message', function(jmes) {
  var message = jmes_to_text(jmes);
  console.log('[bot.message] ' + message);
});

bot.on('end', function () {
  console.log('[bot.end] ');
});

const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.setPrompt('> ');
rl.on('line', function(line) {
  bot.chat(line);
})
rl.on('close', function() {
  bot.quit();
})


function jmes_to_text(jmes) {
  var message = '';
  if (jmes.text)
    message = jmes.text;

  if (jmes.extra)
    jmes.extra.forEach(function(v, i, a){
        message += v.text;
      });
  return message;
}

function safe_chat() {

}