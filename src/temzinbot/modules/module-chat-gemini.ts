import { TemzinBot } from '..';
import { GoogleGenerativeAI } from '@google/generative-ai';

let isApiCalling = false;

const AiDefinition = {
  apiKey: process.env.GEMINI_API_KEY,
  matchKeyword: process.env.GEMINI_MATCH_KEYWORD || 'temzin',
  systemRoleContent:
    process.env.GEMINI_SYSTEM_ROLE_CONTENT ||
    `あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。`,
};

export default (bot: TemzinBot) => {

  if (!AiDefinition.apiKey) {
    bot.log('[GEMINI] No apikey found.');
    return;
  }
  bot.log(`[GEMINI] ${JSON.stringify(AiDefinition)}`);
  
  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const matchKeyword = AiDefinition.matchKeyword.toLocaleLowerCase();
    const match = message.match(new RegExp(`(${matchKeyword})\\s+(.*)\\)?`, 'i'));

    if (!match) {
      return;
    }

    const content = match[2].replace(')', '');
    if (!content) {
      bot.safechat('[GEMINI] 内容がないようです。');
      return;
    }

    if (isApiCalling) {
      bot.safechat('[GEMINI] 前の質問の処理中です。しばらくお待ちください。');
      return;
    }

    try {
      isApiCalling = true;
      // bot.log('[GEMINI]', `Q: ${content}`);

      const genAI = new GoogleGenerativeAI(AiDefinition.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const question = `${content}`;

      const result = await model.generateContent([
        AiDefinition.systemRoleContent,
        question,
      ]);

      const response = result.response;
      const answer = response.text();

      // bot.log('[GEMINI]', `A: ${answer}`);
      bot.safechat(answer);
    } catch (err) {
      bot.safechat('[GEMINI] APIの呼び出し中にエラーが起きました。');
      console.error(err.toString());
    } finally {
      isApiCalling = false;
    }
  });
};
