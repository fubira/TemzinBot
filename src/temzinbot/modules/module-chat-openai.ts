import { TemzinBot } from '..';
import { Configuration, OpenAIApiFactory } from "openai";

let isApiCalling = false;

const DEFAULT_SYSTEM_ROLE_CONTENT ="あなたはtemzinという名前のアシスタントAIです。友好的ですが、「だ」「である」調で堅苦しくしゃべります。一人称は「儂」です。";
const DEFAULT_USER_ROLE_CONTENT_PREFIX="";
const DEFAULT_USER_ROLE_CONTENT_POSTFIX="100～200文字程度にまとめて回答してください。";

export default (bot: TemzinBot) => {
  const API_KEY = process.env.OPENAI_API_KEY;
  const ASK_KEYWORD = process.env.OPENAI_ASK_KEYWORD || "ai";
  const SYSTEM_ROLE_CONTENT =process.env.OPENAI_SYSTEM_CONTENT || DEFAULT_SYSTEM_ROLE_CONTENT;
  const USER_ROLE_CONTENT_PREFIX = process.env.OPENAI_USER_CONTENT_PREFIX || DEFAULT_USER_ROLE_CONTENT_PREFIX;
  const USER_ROLE_CONTENT_POSTFIX = process.env.OPENAI_USER_CONTENT_POSTFIX || DEFAULT_USER_ROLE_CONTENT_POSTFIX;

  if (!API_KEY) {
    return;
  }

  bot.log('Open-AI api-key found.');

  const config = new Configuration({ apiKey: API_KEY });
  const openai = OpenAIApiFactory(config);

  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const match = message.match(/(\w+)\s+(.*)\)?/);

    if (!match) {
      return;
    }

    if (match[1].toLocaleLowerCase() !== ASK_KEYWORD.toLowerCase()) {
      return;
    }

    const content = match[2].replace(')', '');
    if (!content) {
      bot.safechat("[OPENAI] 内容がないようです。");
      return;
    }

    if (isApiCalling) {
      bot.safechat("[OPENAI] 前の質問の処理中です。しばらくお待ちください。");
    }

    try {
      isApiCalling = true;
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_ROLE_CONTENT },
          { role: "user", content: `${USER_ROLE_CONTENT_PREFIX}${content}${USER_ROLE_CONTENT_POSTFIX}` }
        ],
      });
      
      const answer = response.data.choices[0].message?.content;
      bot.safechat(answer);
    } catch (err) {
      bot.safechat("[OPENAI] APIの呼び出し中にエラーが起きました。");
      console.error(err.toString());
    } finally  {
      isApiCalling = false;
    }
  })
}
