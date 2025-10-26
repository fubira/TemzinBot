import fs from 'node:fs';
import path from 'node:path';
import type { TemzinBot } from '@/temzinbot';

interface JsonAnswerItem {
  keyword: string; // JSONではRegExpオブジェクトを直接表現できないため、文字列として格納
  answer: string;
}

interface ProcessedAnswerItem {
  keyword: RegExp;
  answer: string;
}

export default (bot: TemzinBot) => {
  const answersPath = path.join(__dirname, 'answers.json');
  let answers: ProcessedAnswerItem[] = [];

  try {
    const rawData = fs.readFileSync(answersPath, 'utf-8');
    const jsonData = JSON.parse(rawData) as JsonAnswerItem[];
    // JSONから読み込んだkeyword文字列をRegExpオブジェクトに変換
    answers = jsonData.map((item) => {
      const match = item.keyword.match(/^\/(.+)\/([gimyus]*)$/);
      if (match && match[1] && match[2] !== undefined) {
        return { answer: item.answer, keyword: new RegExp(match[1], match[2]) };
      }
      // 正規表現リテラル形式でない場合は、警告を出し、通常の文字列としてRegExpを作成
      bot.log(
        `[AnswerModule] Invalid regex format in answers.json: ${item.keyword}. Treating as plain string.`
      );
      return { answer: item.answer, keyword: new RegExp(item.keyword) };
    });
    bot.log(`[AnswerModule] Loaded ${answers.length} answers.`);
  } catch (error) {
    bot.log('[AnswerModule] Failed to load answers.json:', error);
    return; // answers.jsonが読み込めない場合はモジュールを初期化しない
  }

  bot.instance.on('chat', (username: string, message: string) => {
    if (username === bot.instance.username) return;

    for (const q of answers) {
      if (message.match(q.keyword)) {
        bot.safechat(q.answer, 1000);
        return; // 最初にマッチしたもので応答し、処理を終了
      }
    }
  });
};
