import Anthropic from '@anthropic-ai/sdk';
import type { TemzinBot } from '..';

let isApiCalling = false;

export default (bot: TemzinBot) => {
  const AiDefinition = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    matchKeyword: process.env.ANTHROPIC_MATCH_KEYWORD || 'AI',
    systemRoleContent:
      process.env.ANTHROPIC_SYSTEM_ROLE_CONTENT ||
      `あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。`,
    userRoleContentPrefix: process.env.ANTHROPIC_USER_ROLE_CONTENT_PREFIX || '',
    userRoleContentPostfix:
      process.env.ANTHROPIC_USER_ROLE_CONTENT_POSTFIX ||
      `100～200文字程度にまとめて回答してください。`,
    modelName: process.env.ANTHROPIC_MODEL_NAME || 'claude-3-5-sonnet-latest',
    maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS) || 1000,
    temperature: Number(process.env.ANTHROPIC_TEMPERATURE) || 0,
  };

  if (!AiDefinition.apiKey) {
    bot.log('[CLAUDE3] No apikey found.');
    return;
  }
  bot.log(`[CLAUDE3] ${JSON.stringify(AiDefinition)}`);

  const anthropic = new Anthropic({
    apiKey: AiDefinition.apiKey,
  });

  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const matchKeyword = AiDefinition.matchKeyword;
    const match = message.match(new RegExp(`\\b(${matchKeyword})\\b\\s*(.*?)(?:\\)|$)`));

    if (!match) {
      return;
    }

    const content = match[2];
    if (!content) {
      bot.safechat('[CLAUDE3] 内容がないようです。');
      return;
    }

    if (isApiCalling) {
      bot.safechat('[CLAUDE3] 前の質問の処理中です。しばらくお待ちください。');
      return;
    }

    try {
      isApiCalling = true;
      bot.log('[CLAUDE3]', `Q: ${content}`);

      const response = await anthropic.messages.create({
        model: AiDefinition.modelName,
        max_tokens: AiDefinition.maxTokens,
        temperature: AiDefinition.temperature,
        system: AiDefinition.systemRoleContent,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${AiDefinition.userRoleContentPrefix}${content}${AiDefinition.userRoleContentPostfix}`,
              },
            ],
          },
        ],
      });

      const answer = response.content.find((c) => c.type === 'text')?.text;

      if (answer) {
        bot.log('[CLAUDE3]', `A: ${answer}`);
        bot.safechat(answer);
      } else {
        bot.safechat('[CLAUDE3] 回答を取得できませんでした。');
      }
    } catch (err) {
      bot.safechat('[CLAUDE3] APIの呼び出し中にエラーが起きました。');
      console.error(err);
    } finally {
      isApiCalling = false;
      bot.log('[CLAUDE3]', `chat complete.`);
    }
  });
};
