import axios from 'axios';
import type { TemzinBot } from '@/core';
import { default as area } from './area.json';

interface WeatherForecast {
  date: string;
  dateLabel: string;
  telop: string;
  temperature: {
    max: { celsius: string | null };
    min: { celsius: string | null };
  };
  chanceOfRain: Record<string, string>;
}

interface WeatherApiResponse {
  location: { city: string };
  forecasts: WeatherForecast[];
}

interface AreaData {
  id: string;
  keyword: string[];
}

function makeForecastMessageFromJson(json: WeatherApiResponse) {
  const { city } = json.location;

  const primaryForecastData = json.forecasts.find((f) => f.temperature.max.celsius !== null);
  const secondaryForecastData = json.forecasts.find((f) => f.temperature.min.celsius !== null);

  if (!primaryForecastData || !secondaryForecastData) {
    return `[${city}の天気] データが取得できませんでした。`;
  }

  const chanceOfRain = Object.values(primaryForecastData.chanceOfRain).reduce(
    (a: string, b: string) => (parseInt(a, 10) > parseInt(b, 10) ? a : b)
  );
  const date = new Date(primaryForecastData.date);

  const title = `[${date.getMonth() + 1}/${date.getDate()} ${city}の天気]`;
  const label = primaryForecastData.dateLabel;
  const telop = primaryForecastData.telop;
  const tempMax =
    primaryForecastData.temperature.max.celsius ||
    secondaryForecastData.temperature.max.celsius ||
    '--';
  const tempMin =
    primaryForecastData.temperature.min.celsius ||
    secondaryForecastData.temperature.min.celsius ||
    '--';

  const forecastText =
    primaryForecastData &&
    `${label}の${city}の天気は ${telop} 気温は${tempMax}℃/${tempMin}℃ 降水確率は ${
      chanceOfRain || '--'
    } です。`;

  return `${title} ${forecastText}`;
}

let last_called = 0;

export default (bot: TemzinBot) => {
  last_called = Date.now();

  bot.instance.on('chat', (username, message) => {
    // 自分の発言は無視
    if (bot.instance.username === username) return;

    // 行頭"天気" or "tenki"を処理する
    if (message.match(/(^|\()(天気|tenki)\s*[(]?([^()]*)[)]?/gi)) {
      // 天気のあとに続く文字列を場所として探す なければ東京
      const [...locations] = RegExp.$3.split(/[ ,]/);

      if (locations.length === 0) {
        locations.push('東京');
      }

      const locationSet = new Set<string>();
      // 指定された文字列をエリアデータの場所名から探す
      locations.forEach((loc) => {
        // まず完全一致で探す
        let value = (area as AreaData[])?.find((a) => a.keyword.find((word) => word === loc));

        // 完全一致がなかった場合、前方一致で探す
        if (!value) {
          value = (area as AreaData[])?.find((a) =>
            a.keyword.find((word) => word?.startsWith(loc) || loc?.startsWith(word))
          );
        }

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
      if (last_called > Date.now() - 1000) {
        bot.safechat(`ちょっとまって早い`);
        return;
      }
      last_called = Date.now();

      // API呼び出し
      try {
        locationIds.forEach(async (id) => {
          const res = await axios.get(`https://weather.tsukumijima.net/api/forecast/city/${id}`, {
            headers: { 'User-Agent': 'WeatherApp/1.0.0' },
          });
          console.log(id, res.data);
          const message = makeForecastMessageFromJson(res.data);

          if (message) {
            bot.safechat(message);
          }
        });
      } catch (err) {
        bot.safechat(`エラーが発生しました:${err}`);
        console.log(err);
      }
    }
  });
};
