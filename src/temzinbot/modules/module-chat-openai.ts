import { TemzinBot } from '..';
import OpenAI from 'openai';

let isApiCalling = false;

export default (bot: TemzinBot) => {
  const AiDefinition = {
    apiKey: process.env.OPENAI_API_KEY,
    matchKeyword: process.env.OPENAI_MATCH_KEYWORD || 'ai',
    systemRoleContent:
      process.env.OPENAI_SYSTEM_ROLE_CONTENT ||
      `あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。`,
    userRoleContentPrefix: process.env.OPENAI_USER_ROLE_CONTENT_PREFIX || '',
    userRoleContentPostfix:
      process.env.OPENAI_USER_ROLE_CONTENT_POSTFIX ||
      `100～200文字程度にまとめて回答してください。`,
  };

  if (!AiDefinition.apiKey) {
    bot.log('[OPENAI] No apikey found.');
    return;
  }
  bot.log(`[OPENAI] ${JSON.stringify(AiDefinition)}`);
  
  /**
   * Initialize OpenAI
   */
  const openai = new OpenAI({
    apiKey: AiDefinition.apiKey,
  });
  
  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const matchKeyword = AiDefinition.matchKeyword.toLocaleLowerCase();
    const match = message.match(new RegExp(`(${matchKeyword})\\s+(.*)\\)?`, 'i'));

    if (!match) {
      return;
    }

    const content = match[2].replace(')', '');
    if (!content) {
      bot.safechat('[OPENAI] 内容がないようです。');
      return;
    }

    if (isApiCalling) {
      bot.safechat('[OPENAI] 前の質問の処理中です。しばらくお待ちください。');
      return;
    }

    try {
      isApiCalling = true;
      bot.log('[OPENAI]', `Q: ${content}`);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: AiDefinition.systemRoleContent
          }, {
            role: 'user',
            content: `${AiDefinition.userRoleContentPrefix}${content}${AiDefinition.userRoleContentPostfix}`,
          },
        ],
      });

      const answer = response.choices[0].message?.content;
      bot.log('[OPENAI]', `A: ${answer}`);
      bot.safechat(answer);
    } catch (err) {
      bot.safechat('[OPENAI] APIの呼び出し中にエラーが起きました。');
      console.error(err.toString());
    } finally {
      isApiCalling = false;
      bot.log('[OPENAI]', `chat complete.`);
    }
  });
};
