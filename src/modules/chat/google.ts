import type { BotInstance } from '@/core';
import { CONSTANTS } from '@/config';
import { onUserChat } from '@/utils';

/**
 * 検索タイプ定義
 */
interface SearchType {
  /** マッチさせる正規表現 */
  regex: RegExp;
  /** 検索URL生成関数 */
  buildUrl: (query: string) => string;
}

/**
 * サポートする検索タイプ
 */
const searchTypes: SearchType[] = [
  {
    regex: /(?:^|\(\s*)(google|sksim|ggl)\s*[(]?([^()]*)[)]?/i,
    buildUrl: (query) => `https://www.google.co.jp/search?q=${query}`,
  },
  {
    regex: /(?:^|\(\s*)(image|img)\s*[(]?([^()]*)[)]?/i,
    buildUrl: (query) => `https://www.google.co.jp/search?tbm=isch&q=${query}`,
  },
  {
    regex: /(?:^|\(\s*)(map|地図)\s*[(]?([^()]*)[)]?/i,
    buildUrl: (query) => `https://www.google.co.jp/maps?q=${query}`,
  },
];

export function googleModule(bot: BotInstance) {
  onUserChat(bot, (_username, message) => {
    for (const searchType of searchTypes) {
      const match = message.match(searchType.regex);

      if (match) {
        const query = match[2]?.trim();

        if (query) {
          const encodedQuery = query.replace(/\s+/g, '+');
          const url = searchType.buildUrl(encodedQuery);

          bot.chat.send(url, { delay: CONSTANTS.CHAT_DELAY.NORMAL });
        }
        return;
      }
    }
  });
};
