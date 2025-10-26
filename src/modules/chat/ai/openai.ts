import OpenAI from 'openai';
import type { TemzinBot } from '@/core';

let isApiCalling = false;

export default (bot: TemzinBot) => {
  const AiDefinition = {
    apiKey: process.env.OPENAI_API_KEY,
    matchKeyword: process.env.OPENAI_MATCH_KEYWORD || 'AI',
    systemRoleContent:
      process.env.OPENAI_SYSTEM_ROLE_CONTENT ||
      `あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。`,
    userRoleContentPrefix: process.env.OPENAI_USER_ROLE_CONTENT_PREFIX || '',
    userRoleContentPostfix:
      process.env.OPENAI_USER_ROLE_CONTENT_POSTFIX ||
      `100～200文字程度にまとめて回答してください。`,
    modelName: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini-search-preview',
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

    const matchKeyword = AiDefinition.matchKeyword;
    const match = message.match(new RegExp(`\\b(${matchKeyword})\\b\\s+(.*?)(?:\\)|$)`));

    if (!match) {
      return;
    }

    const content = match[2];
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
        model: AiDefinition.modelName,
        messages: [
          {
            role: 'system',
            content: AiDefinition.systemRoleContent,
          },
          {
            role: 'user',
            content: `${AiDefinition.userRoleContentPrefix}${content}${AiDefinition.userRoleContentPostfix}`,
          },
        ],
      });

      const answer = response.choices[0]?.message?.content;
      if (answer) {
        bot.log('[OPENAI]', `A: ${answer}`);
        bot.safechat(answer);
      } else {
        bot.safechat('[OPENAI] 回答を取得できませんでした。');
      }
    } catch (err) {
      bot.safechat('[OPENAI] APIの呼び出し中にエラーが起きました。');
      console.error(err);
    } finally {
      isApiCalling = false;
      bot.log('[OPENAI]', `chat complete.`);
    }
  });
};
