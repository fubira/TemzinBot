import { TemzinBot } from '..';
import { Configuration, OpenAIApiFactory } from 'openai';

let isApiCalling = false;

export default (bot: TemzinBot) => {
  const AiDefinition = {
    apiKey: process.env.OPENAI_API_KEY,
    askKeyword: process.env.OPENAI_ASK_KEYWORD || 'ai',
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

  /**
   * Initialize OpenAI
   */
  const openai = OpenAIApiFactory(
    new Configuration({
      apiKey: AiDefinition.apiKey,
    })
  );

  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const match = message.match(/(\w+)\s+(.*)\)?/);

    if (!match) {
      return;
    }

    if (match[1].toLocaleLowerCase() !== AiDefinition.askKeyword.toLowerCase()) {
      return;
    }

    const content = match[2].replace(')', '');
    if (!content) {
      bot.safechat('[OPENAI] 内容がないようです。');
      return;
    }

    if (isApiCalling) {
      bot.safechat('[OPENAI] 前の質問の処理中です。しばらくお待ちください。');
    }

    try {
      isApiCalling = true;
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
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

      const answer = response.data.choices[0].message?.content;
      bot.safechat(answer);
    } catch (err) {
      bot.safechat('[OPENAI] APIの呼び出し中にエラーが起きました。');
      console.error(err.toString());
    } finally {
      isApiCalling = false;
    }
  });
};
