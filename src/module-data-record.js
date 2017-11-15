const jsonfile = require('jsonfile');
const filename = 'data.record.json'

module.exports = function(bot) {
  this.record = [];
  this.last_record_user = null;
  this.last_record_key = null;

  // 起動時に保存されたデータをロードする
  jsonfile.readFile(filename, (err, obj) => {
    if (!err) {
      this.record = obj;
    }
  });

  // 指定されたキーと結び付けられたデータを記憶する
  function record(key, value, teacher) {
    remove(key);

    this.record.push({
      key: key,
      value: value,
      teacher: teacher,
      date: new Date().getTime()
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

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    // 記憶データの各キーワードとマッチ判定を行い、
    // 該当する文言があればvalueをチャットに出力する
    if (this.record) {
      this.record.forEach((r) => {
        if (message.match(new RegExp('^' + r.key + "$"))) {
          bot.safechat(r.value.replace(new RegExp('^\/', '')));
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
      var key = RegExp.$1;
      var value = RegExp.$2;
      record(key, value, username);

      if (value.trim().startsWith('/')) {
        bot.safechat('/tell ' + username + ' コマンドは覚えられないよ')
        bot.log('[REJECTED] ' + username + ' による ' + key + ':' + value + ' の登録が拒否されました');
      } else {
        bot.safechat('いま' + username + 'が教えてくれたんだけど、' + key + 'は' + value + 'なんだって');
        bot.log('[record] sender: ' + username + ', key: {' + key + '}, value: {' + value + '}');

        this.last_record_user = username;
        this.last_record_key = key;
      }
    }

    // 記憶の削除
    if (message.match(/^(?:削除|忘れる|消去)\s+(\S*)/)) {
      var key = RegExp.$1;
      remove(key);
      
      bot.log('[remove] sender: ' + username + ', key: {' + key + '}');
    }
  });
}