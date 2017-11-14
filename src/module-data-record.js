const jsonfile = require('jsonfile');
const filename = 'data.record.json'

module.exports = function(bot) {
  this.record = [];

  jsonfile.readFile(filename, (err, obj) => {
    if (err) {
      this.record = [];
    } else {
      this.record = obj;
    }
  });

  function record(key, value, sender) {
    remove(key);
    this.record.push({key: key, value: value, sender: sender, date: new Date()});
    jsonfile.writeFileSync(filename, this.record);
  }

  function remove(key) {
    var new_record = this.record.filter((item, index) => {
      if (item.key !== key) return true;
    });
    this.record = new_record;
    jsonfile.writeFileSync(filename, this.record);
  }

  this.last_record_user = null;
  this.last_record_key = null;

  bot.on('chat', (username, message) => {
    // 記憶データの各キーワードとマッチ判定を行い、
    // 該当する文言があればvalueをチャットに出力する
    if (this.record) {
      this.record.forEach((r) => {
        if (message.match(new RegExp('^' + r.key + "$"))) {
          bot.safechat(r.value);
        }
      });
    }

    if (username === last_record_user && message.match(/^うそです/)) {
      bot.safechat('なんだうそか');
      remove(this.last_record_key);

      this.last_record_user = null;
      this.last_record_key = null;
  }
  });

  bot.on('whisper', (username, message) => {
    // 記憶があるかどうかの確認
    if (message.match(/^記憶$/)) {
      if (this.record && this.record.length > 0) {
        this.record.forEach((r) => {
          bot.safechat('/r [' + r.key + ']: ' + r.value);
        });
      } else {
        bot.safechat('/r なにも知らないよ');
      }
    }

    if (message.match(/^(?:記憶|記録|保存)\s+(\S+)\s+(\S*)/)) {
      var key = RegExp.$1;
      var value = RegExp.$2;

      bot.log('[record] sender: ' + username + ', key: {' + key + '}, value: {' + value + '}');
      bot.safechat('いま' + username + 'が教えてくれたんだけど、' + key + 'は' + value + 'なんだって');
      record(key, value, username);

      this.last_record_user = username;
      this.last_record_key = key;
    }

    if (message.match(/^(?:削除|消去|忘却)\s+(\S*)/)) {
      var key = RegExp.$1;
      bot.log('[remove] sender: ' + username + ', key: {' + key + '}');
      remove(key);
    }
  });
}