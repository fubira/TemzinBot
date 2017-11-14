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

    // 記憶があるかどうかの確認
    if (message.match(/(\w*)[,.。、 ]?(?:記憶|記録)(?:は？|ある？)/)) { 
      if (this.record && record.length > 0) {
        bot.safechat(this.record[0].key + 'とか' + this.record.length + '個ぐらい');
      } else {
        bot.safechat('ないよ');
      }
    }

    // 記憶の追加
    if (message.match(/(\w*)[,.。、 ]?(?:記憶|記録|覚えて|おぼえて)[。\.\w]?([^\w=は]+)+(?:[\s=は]+)(.+)/)) {
      var target = RegExp.$1;
      var key = RegExp.$2;
      var value = RegExp.$3;

      if (target === bot.username) {
        bot.log('[record] <' + key + ">:" + value);
      }

      this.record.push({key: key, value: value});
      jsonfile.writeFileSync(filename, this.record);

      bot.safechat(key + 'は' + value + '、' + target + '覚えた');
    }

    // 記憶の削除
    if (message.match(/(\w*)[,.。、 ]?(?:消去|忘れて|わすれて)[。\.\w]?([^\w=]+)/)) {
      var target = RegExp.$1;
      var key = RegExp.$2;
      if (target === bot.username) {
        bot.log('[delete] <' + key + ">");
      }

      var new_record = this.record.filter((item, index) => {
        if (item.key != key) return true;
      });
      this.record = new_record;

      jsonfile.writeFileSync(filename, this.record);

      bot.safechat(key + 'はもう消した');
    }
  });
}