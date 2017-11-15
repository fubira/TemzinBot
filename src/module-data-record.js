const jsonfile = require('jsonfile');
const filename = 'data.record.json'
const record_lifetime_ms = 3 * 24 * 60 * 60 * 1000;

module.exports = function(bot) {
  this.record = [];
  this.last_record_user = null;
  this.last_record_key = null;

  // 起動時に保存されたデータをロードする
  jsonfile.readFile(filename, (err, obj) => {
    if (!err) {
      this.record = obj;
      expire();
    }
  });

  function get_expire_at() {
    return Date.now() + record_lifetime_ms;
  }

  // 指定されたキーと結び付けられたデータを記憶する
  function record(key, value, teacher) {
    remove(key);

    this.record.push({
      key: key,
      value: value,
      teacher: teacher,
      expire_at: get_expire_at()
    });

    jsonfile.writeFileSync(filename, this.record);
  }

  // 指定されたキーの記憶データを消去する
  function remove(key) {
    var new_record = this.record.filter((item, index) => {
      if (item.key !== key) return true;
    });
    this.record = new_record;

    jsonfile.writeFileSync(filename, this.record);
  }

  // 一定期間使われなかった記憶は消滅する
  function expire() {
    var expired = [];
    this.record.forEach((r) => {
      bot.log('[data-record] ' + Date.now() + ': ' + r.expire_at)
      if (Date.now() > r.expire_at) {
        bot.log('[data-record] expired [' + r.key + ']: ' + r.value)
        expired.push(r.key);
      }
    });
    expired.forEach((key) => {
      remove(key);
    });
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    // 記憶データの各キーワードとマッチ判定を行い、
    // 該当する文言があればvalueをチャットに出力する
    if (this.record) {
      this.record.forEach((r) => {
        if (message.match(new RegExp('^' + r.key + "$"))) {
          bot.safechat(r.key + 'は' + r.value.replace(new RegExp('^\/', '')));

          // 使われた記憶は寿命を延ばす
          r.expire_at = get_expire_at();
        }
      });
    }

    // うそです(適当なUndo機能)
    if (username === last_record_user && message.match(/^(?:うそ|ウソ|嘘)(?:だよ|です)/)) {
      bot.safechat('なんだうそか');
      remove(this.last_record_key);

      this.last_record_user = null;
      this.last_record_key = null;
    }
  });

  bot.on('whisper', (username, message) => {
    // どんなデータを記憶しているかどうかを確認する手段
    if (message.match(/^記憶$/)) {
      if (this.record && this.record.length > 0) {
        this.record.forEach((r) => {
          bot.safechat('/r ' + r.key + ' は ' + r.value);
        });
      } else {
        bot.safechat('/r なにも知らないよ');
      }
    }

    // 記憶の追加
    if (message.match(/^(?:記憶|覚える|保存)\s+(\S+)\s+(\S*)/)) {
      var key = RegExp.$1.trim();
      var value = RegExp.$2.trim();
      
      if (key === value) {
        bot.safechat('/tell ' + username + ' なにを言っているのかよくわからないな')
      } else if (key.startsWith('/') || value.startsWith('/')) {
        bot.safechat('/tell ' + username + ' コマンドは覚えられないよ')
        bot.log('[data-record] *REJECTED* ' + username + ' による ' + key + ':' + value + ' の登録が拒否されました');
      } else {
        record(key, value, username);

        bot.safechat('いま' + username + 'が教えてくれたんだけど、' + key + 'は' + value + 'なんだって');
        bot.log('[data-record] sender: ' + username + ', key: {' + key + '}, value: {' + value + '}');

        this.last_record_user = username;
        this.last_record_key = key;
      }
    }

    // 記憶の削除
    if (message.match(/^(?:削除|忘れる|消去)\s+(\S*)/)) {
      var key = RegExp.$1;
      remove(key);
      
      bot.log('[data-record] sender: ' + username + ', key: {' + key + '}');
    }
  });
}