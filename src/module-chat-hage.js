module.exports = function(bot) {
  bot.on('chat', (username, message) => {
    if (message.match(/^毛根|もうこん/))
      bot.safechat('また髪の話してる・・・');

    if (message.match(/(\w*)(?:は|の|is|って)?(?:ハゲ|はげ|禿)/) && RegExp.$1 === bot.username)
      bot.safechat('ハ、ハゲちゃうわ！');
  });
}