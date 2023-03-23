import { TemzinBot } from '..';

export default (bot: TemzinBot) => {
  let is_dead = false;

  bot.instance.on('death', () => {
    is_dead = true;
  });

  bot.instance.on('spawn', () => {
    if (!is_dead) {
      return;
    }

    bot.randomchat([
      'ギエピー',
      '死ぬかと思った',
      '致命傷ですんだ',
      'あやうく死ぬところだった',
    ]);
    is_dead = false;
  });
};
