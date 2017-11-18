const dateformat = require('dateformat');
const delay = require('delay');
const readline = require('readline');

module.exports = function(bot) {
  this.bot = bot;

  // 入力処理を有効にする
  this.bot.init_readline = () => {
    this.rl = readline.createInterface({input: process.stdin, output: process.stdout});
    this.rl.setPrompt('> ');

    // 入力はチャットに流す
    this.rl.on('line', (line) => {
      this.safechat(line);
    });

    // CTRL+DまたはCTRL+CでSTDINが閉じたらbotも閉じる
    this.rl.on('close', () => {
      this.bot.log('[bot.readline] input closed');
      delay(1000).then(() => { this.bot.quit(); })
    })
  }

  // prompt処理とかをちゃんとやるログ出力
  this.bot.log = (...args) => {
    readline.cursorTo(process.stdout, 0);

    if (typeof args[0] === 'string') {
      // 出力の頭に現在時刻を挿入
      args[0] = '[' + dateformat(new Date(), 'isoTime') + '] ' + args[0];
    }
    console.log.apply(console, args);

    if (typeof this.rl !== 'undefined')
      this.rl.prompt(true);
  }

  // jmes形式のメッセージからテキスト成分だけを抜き出して文字列で返す
  this.bot.jmes_to_text = (jmes) => {
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
  this.safechat_send_text_cache = [];
  this.safechat_last_send_time = new Date().getTime();
  this.safechat_continuous_count = 0;

  this.safechat = (text) => {
    var current_time = new Date().getTime();
    var elapsed_ms = current_time - safechat_last_send_time;

    if (!text)
      return;

    if (elapsed_ms > 1000) {
      this.safechat_continuous_count = 0;
    }

    this.safechat_continuous_count++;
    if (this.safechat_continuous_count > 10) {
      this.bot.log('[bot.safechat] *REJECTED* 短時間での大量メッセージが送信がされました');
      return;
    }

    if (elapsed_ms > 3000) {
      // 一定時間経過したら直前のメッセージは忘れる
      this.safechat_send_text_cache = [];
    }

    if (this.safechat_send_text_cache.find((value)=>{ return value === text; })) {
      this.bot.log('[bot.safechat] *REJECTED* 一定時間内に同一の文章が複数回送信されました');
      return;
    }
    this.safechat_send_text_cache.push(text);

    this.safechat_last_send_time = current_time;
    this.bot.chat(text);
  }

  this.bot.safechat = (text, delay_ms = 800) => {
    delay(delay_ms).then(() => { this.safechat(text); });
  }

  // 配列で定義された複数の文言のうちの一つをランダム選択してチャット送信する
  this.bot.randomchat = (messages, delay_ms = 800) => {
    var message;
    if (Array.isArray(messages)) {
      message = messages[Math.floor(Math.random() * messages.length)]
    } else {
      message = messages;
    }
    delay(delay_ms).then(() => { this.safechat(message); });
  }
}
