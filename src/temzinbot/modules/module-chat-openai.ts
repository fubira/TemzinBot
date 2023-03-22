import { TemzinBot } from '..';
import { Configuration, OpenAIApiFactory } from "openai";

export default (bot: TemzinBot) => {
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return;
  }

  bot.log('Open-AI api-key found.');

  const config = new Configuration({ apiKey: API_KEY });
  const openai = OpenAIApiFactory(config);

  bot.instance.on('chat', async (username: string, message: string) => {
    // if (username === bot.instance.username) return;
        
    const match = message.match(/(AI|ai)\s+(.*)/);

    if (match && match[1].toLocaleLowerCase() === "ai") {
      const content = match[2];

      try {
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: content
          }]
        })
        console.log(JSON.stringify(response.data));
        
        const answer = response.data.choices[0].message?.content;
        bot.safechat(answer, 500);
      } catch (err) {
        console.error(err.toString());
      }
    }
  })
}
