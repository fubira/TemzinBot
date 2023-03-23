import * as Mineflayer from 'mineflayer';
import { TemzinBot } from '..';

let last_joined_player: string | undefined = undefined;

export default (bot: TemzinBot) => {
  /**
   * 自分が login したときに挨拶する
   */
  bot.instance.once('login', () => {
    bot.safechat('hi', 2000);
  });

  /**
   * 最後に入ってきた人の挨拶に応答する
   */
  bot.instance.on('playerJoined', (player: Mineflayer.Player) => {
    last_joined_player = player.username;
  });

  bot.instance.on('chat', (username: string, message: string) => {
    if (username === bot.instance.username) return;

    if (username === last_joined_player) {
      if (message.match(/^(?:hi|hai|ひ|日|はい|へ)$/)) bot.safechat('hi', 2000);
      if (message.match(/^(?:わんへ|わんっ|wannhe)/))
        bot.safechat('わんへ', 2000);
      if (message.match(/^(?:こん|kon)$/)) bot.safechat('こん', 2000);

      last_joined_player = undefined;
    }
  });
};
