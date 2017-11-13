module.exports = function(bot) {
  this.bot = bot;

  // jmes形式のメッセージからテキスト成分だけを抜き出して文字列で返す
  bot.jmes_to_text = (jmes) => {
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

  bot.safechat = (text) => {
    var current_time = new Date().getTime();
    var is_elapsed_ms = (delay) => {
      return (current_time - safechat_last_send_time) > delay;
    }
    
    if (!text)
      return;

    if (!is_elapsed_ms(500)) {
      console.log('[WARNING] 短時間の連続したメッセージ送信が拒否されました');
      return;
    }

    if (is_elapsed_ms(3000)) {
      // 一定時間経過したら直前のメッセージは忘れる
      this.safechat_last_send_text = "";
    }

    if (text === safechat_last_send_text) {
      console.log('[WARNING] 同一文章の連続送信が拒否されました');
      return;
    }

    this.safechat_last_send_text = text;
    this.safechat_last_send_time = current_time;
    bot.chat(text);
  }
}
