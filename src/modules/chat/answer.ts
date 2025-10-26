import fs from 'node:fs';
import path from 'node:path';
import type { BotInstance } from '@/core';
import { CONSTANTS } from '@/config';
import { onUserChat } from '@/utils';

const MODULE_NAME = 'AnswerModule';

interface JsonAnswerItem {
  keyword: string;
  answer: string;
}

interface ProcessedAnswerItem {
  keyword: RegExp;
  answer: string;
}

interface FileReader {
  readJson<T>(path: string): T;
}

const defaultFileReader: FileReader = {
  readJson: <T>(path: string): T => {
    const rawData = fs.readFileSync(path, 'utf-8');
    return JSON.parse(rawData) as T;
  },
}

/**
 * 文字列を正規表現に変換
 * @param regexStr - 変換する文字列（正規表現リテラル形式 /pattern/flags または通常の文字列）
 * @param logger - ログ出力関数（オプション）
 * @returns 正規表現オブジェクト
 */
function parseRegExpString(regexStr: string, logger?: (msg: string) => void): RegExp {
  const match = regexStr.match(/^\/(.+)\/([gimyus]*)$/);
  if (match?.[1]) {
    try {
      return new RegExp(match[1], match[2] || '');
    } catch {
      logger?.(`Invalid regex pattern: ${regexStr}. Using literal match.`);
    }
  }
  const escaped = regexStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped);
}

export function answerModule(bot: BotInstance, fileReader: FileReader = defaultFileReader) {
  const answersPath = path.join(__dirname, 'answers.json');
  let answers: ProcessedAnswerItem[] = [];

  try {
    const jsonData = fileReader.readJson<JsonAnswerItem[]>(answersPath);
    answers = jsonData.map((item) => ({
      answer: item.answer,
      keyword: parseRegExpString(item.keyword, (msg) => bot.log(`[${MODULE_NAME}] ${msg}`)),
    }));
    bot.log(`[${MODULE_NAME}] Loaded ${answers.length} answers.`);
  } catch (error) {
    bot.log(`[${MODULE_NAME}] Failed to load answers.json:`, error);
    return;
  }

  onUserChat(bot, (_username, message) => {
    for (const q of answers) {
      if (message.match(q.keyword)) {
        bot.chat.send(q.answer, { delay: CONSTANTS.CHAT_DELAY.NORMAL });
        return; // 最初にマッチしたもので応答し、処理を終了
      }
    }
  });
};
