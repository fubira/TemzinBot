const fetch = require('node-fetch');
const area = require('../area.json');

function parseForecastJson(json) {
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
  
  bot.on('chat', (username, message) => {
    if (bot.username === username) return;

    if (message.match(/(天気|tenki)(.*)$/)) {
      const [,...locations] = RegExp.$2.replace(/[\(\)]/g,'').split(/[ 　,]/);

      if (locations.length === 0) {
        locations.push('東京');
      }

      const locationSet = new Set();
      locations.map((loc) => {
        const re = new RegExp(loc || '東京', "i");
        const value = Object.values(area).find((a) => (a.name + a.enName).match(re));
        if (value) {
          locationSet.add(value.children[0]);
        }
      });
      const locationIds = Array.from(locationSet);

      if (locationIds.length === 0) {
        bot.safechat(`知らない場所です: ${locations}`);
      }

      const getLocationForecastMessage = async (id) => {
        const res = await fetch(`https://weather.tsukumijima.net/api/forecast/city/${id}`);
        const json = await res.json();
        return parseForecastJson(json);
      };

      try {
        locationIds.forEach(async (id) => {
          const message = await getLocationForecastMessage(id);
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