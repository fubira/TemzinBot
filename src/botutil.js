var target_bot;

module.exports.setup = (bot) => {
  console.log('Setup bot: ' + bot);
  target_bot = bot;
}

// jmes形式のメッセージからテキスト成分だけを抜き出して文字列で返す
module.exports.jmes_to_text = (jmes) => {
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
var safechat_last_send_text = "";
var safechat_last_send_time = new Date().getTime();

module.exports.safechat = (text) => {
  var current_time = new Date().getTime();
  var is_elapsed_ms = (delay) => {
    return (current_time - safechat_last_send_time) > delay;
  }
  
  if (!text)
    return;

  if (!is_elapsed_ms(500)) {
    console.log('[WARNING] 短時間の連続してメッセージ送信が拒否されました');
    return;
  }

  if (is_elapsed_ms(3000)) {
    // 一定時間経過したら直前のメッセージは忘れる
    safechat_last_send_text = "";
  }

  if (text === safechat_last_send_text) {
    console.log('[WARNING] 同一文章の連続送信が拒否されました');
    return;
  }

  safechat_last_send_text = text;
  safechat_last_send_time = current_time;
  target_bot.chat(text);
}
