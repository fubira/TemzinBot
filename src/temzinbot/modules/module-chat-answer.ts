import { TemzinBot } from '@/temzinbot';

export default (bot: TemzinBot) => {
  bot.instance.on('chat', (username: string, message: string) => {
    const answers = [
      {
        keyword: /^(map|dynmap|まp|まｐ|ダイナ|マップ|地図)/i,
        answer: 'http://kenmomine.club:8123/',
      },
      {
        keyword: /^(路線|線路|路線図|鉄道)/i,
        answer:
          'http://kenmomine.wiki.fc2.com/wiki/%E8%B7%AF%E7%B7%9A%E5%9B%B3',
      },
      {
        keyword: /^(event|イベント|ev|いべんと)/i,
        answer:
          'http://kenmomine.wiki.fc2.com/wiki/%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E4%BC%81%E7%94%BB/',
      },
      {
        keyword: /^(wiki|うぃき|ウィキ)/i,
        answer: 'http://kenmomine.wiki.fc2.com/',
      },
      {
        keyword: /^(ウニ|うに|uni)/gi,
        answer: 'うに',
      },
      {
        keyword: /^(ブリ|ぶり|buri)/gi,
        answer: 'うに',
      },
      {
        keyword: /^(ぷちぷち|putiputi)/gi,
        answer: 'ぷちぷちあ！',
      },
      {
        keyword: /^(為替|ドル円|JPY|USD|EUR|GBP)/gi,
        answer: 'https://sekai-kabuka.com/kawase.html',
      },
      {
        keyword: /^(時刻|時間|JST)/gi,
        answer: 'https://www.nict.go.jp/JST/JST5.html',
      },
      {
        keyword: /^(kabuka|株価)/gi,
        answer: 'https://sekai-kabuka.com/',
      },
      {
        keyword: /^(tenhou|tenho|麻雀|天鳳)/gi,
        answer: 'https://tenhou.net/make_lobby.html?lobby',
      },
      {
        keyword: /^(duel|デュエル|GF|ゴッドフィールド|godfield)/gi,
        answer: 'https://godfield.net/',
      },
      {
        keyword: /^(qma|QMAclone|quiz|kuizu|クイズ)/gi,
        answer: 'http://kishibe.dyndns.tb/QMAClone/',
      },
      {
        keyword:
          /^(oekaki|お絵かき|pictsense|ピクトセンス|quiz|kuizu|クイズ)/gi,
        answer: 'https://pictsense.com/',
      },
      {
        keyword: /^(oekaki|お絵かき|dengon|伝言|伝言ゲーム)/gi,
        answer: 'https://garticphone.com/ja',
      },
      {
        keyword: /^(jisin|jishin|地震|自信|じしん|自身)/gi,
        answer: 'http://www.kmoni.bosai.go.jp/',
      },
      {
        keyword: /^(taifu|taifuu|taihu|台風)/gi,
        answer: 'https://www.jma.go.jp/bosai/map.html#contents=typhoon',
      },
      {
        keyword:
          /^(ra[dj]io|ら[じぢ]お|ラ[ヂジ]オ|ラディオ|レディオ|ラヂヲ|レイディオ)/gi,
        answer: 'http://radio.kenmomine.club:8980/r/kenmomine',
      },
    ];

    if (username === bot.instance.username) return;

    answers.forEach((q) => {
      if (message.match(q.keyword)) {
        bot.safechat(q.answer, 1000);
      }
    });
  });
};
