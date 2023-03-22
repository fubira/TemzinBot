import { TemzinBot } from '..';
import { Configuration, OpenAIApiFactory } from "openai";

let isApiCalling = false;

export default (bot: TemzinBot) => {
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return;
  }

  bot.log('Open-AI api-key found.');

  const config = new Configuration({ apiKey: API_KEY });
  const openai = OpenAIApiFactory(config);

  bot.instance.on('chat', async (username: string, message: string) => {
    if (username === bot.instance.username) return;

    const match = message.match(/(AI|ai)\s+(.*)/);

    if (match && match[1].toLocaleLowerCase() !== "ai") {
      return;
    }

    const content = match[2];
    if (!content) {
      bot.safechat("内容がないようです。", 500)
      return;
    }

    if (isApiCalling) {
      bot.safechat("前の質問の処理中です。しばらくお待ちください。", 500)
    }

    try {
      isApiCalling = true;
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "あなたは「ぽん子」という名前の女の子です。一人称は「ぽんこ」です。語尾には「ぽん」をつけてください。"
        },{
          role: "user",
          content: `次の質問に対して、できるだけ250文字以内にまとめて回答してください。 「${content}」`
        }]
      });
      
      const answer = response.data.choices[0].message?.content;
      bot.safechat(answer, 500);
    } catch (err) {
      bot.safechat("OpenAI APIの呼び出し中にエラーが起きました", 500);
      console.error(err.toString());
    } finally  {
      isApiCalling = false;
    }
  })
}
