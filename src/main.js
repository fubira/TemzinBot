require('dotenv').config();
const delay = require('delay');
const readline = require('readline');

console.log('Connecting to [' + process.env.MC_HOST +':' + process.env.MC_PORT + ']');
console.log('User [' + process.env.MC_USERNAME + ']');

var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: process.env.MC_USERNAME,
  password: process.env.MC_PASSWORD,
  verbose: true
});

bot.on('connect', () => {
  console.log("[bot.connect] connected.");
  setup_readline();
});

bot.on('chat', (username, message, translate, jsonMsg, matches) => {
  console.log('[bot.chat] <' + username + '>: ' + message);
});

bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
  console.log('[bot.whisper] <' + username + '>: ' + message);
  safe_chat(username + "さんが" + message + "って言ってるよ");
});

bot.on('message', (jmes) => {
  var message = jmes_to_text(jmes);
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

function setup_readline() {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  rl.setPrompt('> ');
  rl.on('line', (line) => {
    // STDINからの入力はBOTにそのまま流す
    safe_chat(line);
    rl.prompt();
  })
  
  rl.on('close', () => {
    // CTRL+DまたはCTRL+CでSTDINが閉じたらbotも閉じる
    bot.chat('bye.');
    delay(1000).then(() => {
      bot.quit();
    })
  })
}

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

/// 同じメッセージのループ送信、短時間での大量送信などを
/// 防ぐ仕組みを入れたチャット送信メソッド
var safe_chat_last_send_text = "";
var safe_chat_last_send_time = new Date().getTime();

function safe_chat(text) {
  var current_time = new Date().getTime();
  var is_elapsed = (delay) => {
    return (current_time - safe_chat_last_send_time) > delay;
  }
  
  if (!text)
    return;

  if (!is_elapsed(500)) {
    console.log('[WARNING] 短時間に連続してメッセージを送ろうとしました');
    return;
  }

  if (is_elapsed(3000)) {
    // 一定時間経過したら直前のメッセージは忘れる
    safe_chat_last_send_text = "";
  }

  if (text === safe_chat_last_send_text) {
    console.log('[WARNING] 同じ文章を続けて送ろうとしました');
    return;
  }

  safe_chat_last_send_text = text;
  safe_chat_last_send_time = current_time;
  bot.chat(text);
}