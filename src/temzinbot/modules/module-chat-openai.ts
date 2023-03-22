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

    const match = message.match(/(\w+)\s+(.*)/);

    if (match || match[1].toLocaleLowerCase() !== "ponco") {
      return;
    }

    const content = match[2];
    if (!content) {
      bot.safechat("内容がないようですぽん。", 500)
      return;
    }

    if (isApiCalling) {
      bot.safechat("前の質問の処理中です。しばらくお待ちくださいぽん。", 500)
    }

    try {
      isApiCalling = true;
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `あなたは「ぽんこ」というアシスタントAIです。一人称は「ぽんこ」です。「～ですぽん。」「～ますぽん！」のように、語尾には必ず「ぽん」をつけて喋ります。`
        }, {
          role: "user",
          content: `次の質問に対して、できるだけシンプルに、長くても100～200文字程度にまとめて回答してください。 「${content}」`
        }]
      });
      
      const answer = response.data.choices[0].message?.content;
      bot.safechat(answer, 500);
    } catch (err) {
      bot.safechat("OpenAI APIの呼び出し中にエラーが起きましたぽん・・・", 500);
      console.error(err.toString());
    } finally  {
      isApiCalling = false;
    }
  })
}
