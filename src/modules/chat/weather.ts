import axios from 'axios';
import type { BotInstance } from '@/core';
import { onUserChat } from '@/utils';
import areaJson from './area.json';

const MODULE_NAME = 'WeatherModule';
const API_MIN_INTERVAL_MS = 1000;

interface HttpClient {
  get<T>(url: string, options?: { headers?: Record<string, string> }): Promise<{ data: T }>;
}

const defaultHttpClient: HttpClient = {
  get: async <T>(url: string, options?: { headers?: Record<string, string> }) => {
    return axios.get<T>(url, options);
  },
};

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

// 型安全なエリアデータ
const area = areaJson as AreaData[];

function makeForecastMessageFromJson(json: WeatherApiResponse) {
  const { city } = json.location;

  const primaryForecastData = json.forecasts.find((f) => f.temperature.max.celsius !== null);
  const secondaryForecastData = json.forecasts.find((f) => f.temperature.min.celsius !== null);

  if (!primaryForecastData || !secondaryForecastData) {
    return `[${city}の天気] データが取得できませんでした。`;
  }

  const chanceOfRain = Object.values(primaryForecastData.chanceOfRain)
    .map((v) => parseInt(v, 10))
    .reduce((a, b) => Math.max(a, b), 0)
    .toString();
  const date = new Date(primaryForecastData.date);

  const title = `[${date.getMonth() + 1}/${date.getDate()} ${city}の天気]`;
  const tempMax =
    primaryForecastData.temperature.max.celsius ||
    secondaryForecastData.temperature.max.celsius ||
    '--';
  const tempMin =
    primaryForecastData.temperature.min.celsius ||
    secondaryForecastData.temperature.min.celsius ||
    '--';

  const forecastText = `${primaryForecastData.dateLabel}の${city}の天気は ${primaryForecastData.telop} 気温は${tempMax}℃/${tempMin}℃ 降水確率は ${
    chanceOfRain || '--'
  } です。`;

  return `${title} ${forecastText}`;
}

export function weatherModule(bot: BotInstance, httpClient: HttpClient = defaultHttpClient) {
  let lastCalled = Date.now();

  onUserChat(bot, async (_username, message) => {
    const weatherMatch = message.match(/(^|\()(天気|tenki)\s*[(]?([^()]*)[)]?/i);

    if (weatherMatch) {
      const locationQuery = weatherMatch[3]?.trim() || '';
      const locations = locationQuery ? locationQuery.split(/[ ,]/).filter(Boolean) : [];
      if (locations.length === 0) {
        locations.push('東京');
      }

      const locationIds = Array.from(
        new Set(
          locations
            .map((loc) =>
              area.find((a) =>
                a.keyword.some((word) => word === loc || word?.startsWith(loc) || loc?.startsWith(word))
              )?.id
            )
            .filter((id): id is string => id !== undefined)
        )
      );

      // ここでIDが一つもない場合、場所名が見つからなかった
      if (locationIds.length === 0) {
        bot.chat.send(`知らない場所です: ${locations}`);
        return;
      }

      // API呼び出しには1秒以上時間をあける
      if (lastCalled > Date.now() - API_MIN_INTERVAL_MS) {
        bot.chat.send(`ちょっとまって早い`);
        return;
      }
      lastCalled = Date.now();

      try {
        await Promise.all(
          locationIds.map(async (id) => {
            const res = await httpClient.get<WeatherApiResponse>(
              `https://weather.tsukumijima.net/api/forecast/city/${id}`,
              { headers: { 'User-Agent': 'WeatherApp/1.0.0' } }
            );
            bot.log(`[${MODULE_NAME}] Fetched weather for city ID: ${id}`);
            const message = makeForecastMessageFromJson(res.data);

            if (message) {
              bot.chat.send(message);
            }
          })
        );
      } catch (err) {
        bot.chat.send(`エラーが発生しました: ${err}`);
        bot.log(`[${MODULE_NAME}] API error:`, err);
      }
    }
  });
};
