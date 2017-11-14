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
      this.bot.log('[readline] input closed');
      delay(1000).then(() => { this.bot.quit(); })
    })
  }

  // prompt処理とかをちゃんとやるログ出力
  this.bot.log = (...args) => {
    readline.cursorTo(process.stdout, 0);
    console.log.apply(console, args);

    if (typeof this.rl !== 'undefined')
      this.rl.prompt();
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
  this.safechat_last_send_text = "";
  this.safechat_last_send_time = new Date().getTime();
  this.safechat_continuous_count = 0;
  this.safechat = (text) => {
    var current_time = new Date().getTime();
    var elapsed_ms = current_time - safechat_last_send_time;

    if (!text)
      return;

    if (elapsed_ms > 500) {
      this.safechat_continuous_count = 0;
    }

    this.safechat_continuous_count++;
    if (this.safechat_continuous_count > 10) {
      this.bot.log('[REJECTED] 短時間での大量メッセージ送信が拒否されました');
      return;
    }
  
    if (elapsed_ms > 3000) {
      // 一定時間経過したら直前のメッセージは忘れる
      this.safechat_last_send_text = "";
    }

    if (text === safechat_last_send_text) {
      this.bot.log('[REJECTED] 同一文章の連続送信が拒否されました');
      return;
    }

    this.safechat_last_send_text = text;
    this.safechat_last_send_time = current_time;
    this.bot.chat(text);
  }

  this.bot.safechat = (text, delay_ms = 500) => {
    delay(delay_ms).then(() => { this.safechat(text); });
  }
}
