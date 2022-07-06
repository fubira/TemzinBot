const fetch = require('node-fetch');
const area = require('../area.json');

function makeForecastMessageFromJson(json) {
  const { city } = json.location;

  const forecastData = json.forecasts.find((f) => f.temperature.min.celsius !== null && f.temperature.max.celsius !== null);
  const chanceOfRain = Object.values(forecastData.chanceOfRain).reduce((a, b) => parseInt(a) > parseInt(b) ? a : b);
  const date = new Date(forecastData.date);

  const title = `[${date.getMonth()+1}/${date.getDate()} ${city}の天気]`
  const label = forecastData.dateLabel;
  const telop = forecastData.telop;
  const tempMax = forecastData.temperature.max.celsius || '--';
  const tempMin = forecastData.temperature.min.celsius || '--';

  const forecastText = forecastData &&
    `${label}の${city}の天気は ${telop} 気温は${tempMax}℃/${tempMin}℃ 降水確率は ${chanceOfRain || '--'} です。`;

  return `${title} ${forecastText}`;
}

module.exports = function(bot) {
  this.last_called = Date.now();
  
  bot.on('chat', (username, message) => {
    // 自分の発言は無視
    if (bot.username === username) return;

    // 行頭"天気" or "tenki"を処理する
    if (message.match(/(^|\()(天気|tenki)\s*[\(]?([^\(\)]*)[\)]?/gi)) {
      // 天気のあとに続く文字列を場所として探す なければ東京
      const [...locations] = RegExp.$3.split(/[ 　,]/);

      if (locations.length === 0) {
        locations.push('東京');
      }

      const locationSet = new Set();
      // 指定された文字列をエリアデータの場所名から探す
      locations.map((loc) => {
        const value = Object.values(area).find((a) => (a.keyword.find((word) => word.startsWith(loc || '東京'))));
        if (value) {
          locationSet.add(value.id);
        }
      });

      // 重複のない気象庁IDでの場所リスト
      const locationIds = Array.from(locationSet);

      // ここでIDが一つもない場合、場所名が見つからなかった
      if (locationIds.length === 0) {
        bot.safechat(`知らない場所です: ${locations}`);
      }

      // API呼び出しには1秒以上時間をあける
      if (this.last_called > Date.now() - 1000) {
        bot.safechat(`ちょっとまって早い`);
        return;
      }
      this.last_called = Date.now();

      // API呼び出し
      try {
        locationIds.forEach(async (id) => {
          const res = await fetch(`https://weather.tsukumijima.net/api/forecast/city/${id}`, { headers: { 'User-Agent': 'WeatherApp/1.0.0' }});
          const json = await res.json();
          const message = makeForecastMessageFromJson(json);

          if(message) {
            bot.safechat(message);
          }
        });
      } catch (err) {
        bot.safechat('エラーが発生しました:' + err);
        console.log(err);
      }
    }
  });
}