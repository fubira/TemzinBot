import { TemzinBot } from '..';
import Anthropic from "@anthropic-ai/sdk"


let isApiCalling = false;

export default (bot: TemzinBot) => {
  const AiDefinition = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    matchKeyword: process.env.ANTHROPIC_MATCH_KEYWORD || 'ai',
    systemRoleContent:
      process.env.ANTHROPIC_SYSTEM_ROLE_CONTENT ||
      `あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。`,
    userRoleContentPrefix: process.env.ANTHROPIC_USER_ROLE_CONTENT_PREFIX || '',
    userRoleContentPostfix:
      process.env.ANTHROPIC_USER_ROLE_CONTENT_POSTFIX ||
      `100～200文字程度にまとめて回答してください。`,
  };

  if (!AiDefinition.apiKey) {
    bot.log('[CLAUDE3] No apikey found.');
    return;
  }
  bot.log(`[CLAUDE3] ${JSON.stringify(AiDefinition)}`);

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  bot.instance.on('chat', async (username: string, message: string) => {

    const matchKeyword = AiDefinition.matchKeyword.toLocaleLowerCase();
    const match = message.match(new RegExp(`^(${matchKeyword})\\s+(.*)\\)?`, 'i'));

    if (!match) {
      return;
    }

    const content = match[2].replace(')', '');
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
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [{
              type: 'text',
              text: `${AiDefinition.systemRoleContent} ${AiDefinition.userRoleContentPrefix}${content}${AiDefinition.userRoleContentPostfix}`,
            }],
          }
        ]
      });

      const answer = response.content[0].text;
      bot.log('[CLAUDE3]', `A: ${answer}`);
      bot.safechat(answer);
    } catch (err) {
      bot.safechat('[CLAUDE3] APIの呼び出し中にエラーが起きました。');
      console.error(err.toString());
    } finally {
      isApiCalling = false;
      bot.log('[CLAUDE3]', `chat complete.`);
    }
  });
};
