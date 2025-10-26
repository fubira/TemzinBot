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

export function answerModule(bot: BotInstance) {
  const answersPath = path.join(__dirname, 'answers.json');
  let answers: ProcessedAnswerItem[] = [];

  try {
    const rawData = fs.readFileSync(answersPath, 'utf-8');
    const jsonData = JSON.parse(rawData) as JsonAnswerItem[];
    // JSONから読み込んだkeyword文字列をRegExpオブジェクトに変換
    answers = jsonData.map((item) => ({
      answer: item.answer,
      keyword: parseRegExpString(item.keyword, (msg) => bot.log(`[${MODULE_NAME}] ${msg}`)),
    }));
    bot.log(`[${MODULE_NAME}] Loaded ${answers.length} answers.`);
  } catch (error) {
    bot.log(`[${MODULE_NAME}] Failed to load answers.json:`, error);
    return; // answers.jsonが読み込めない場合はモジュールを初期化しない
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
