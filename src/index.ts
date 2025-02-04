import 'dotenv/config';
import * as Readline from 'readline';
import TemzinBot from '@/temzinbot';

// import moduleChatHi from 'temzinbot/modules/module-chat-hi';
import moduleChatAnswer from '@/temzinbot/modules/module-chat-answer';
import moduleChatCountdown from '@/temzinbot/modules/module-chat-countdown';
import moduleChatDeath from '@/temzinbot/modules/module-chat-death';
import moduleChatGoogle from '@/temzinbot/modules/module-chat-google';
// import moduleChatUrlRepeat from '@/temzinbot/modules/module-chat-url-repeat';
import moduleChatWeather from '@/temzinbot/modules/module-chat-weather';
import moduleChatOpenAI from '@/temzinbot/modules/module-chat-openai';
import moduleChatGemini from './temzinbot/modules/module-chat-gemini';
import moduleChatClaude3 from './temzinbot/modules/module-chat-claude3';

/**
 * Initialize Readline
 */
const readline: Readline.Interface = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Instance of Bot
 */
let temzinBot: TemzinBot | undefined = undefined;

/**
 * Startup Bot
 */
function start() {
  temzinBot = new TemzinBot();
  temzinBot.createBot(
    {
      host: String(process.env.MC_HOST),
      port: Number(process.env.MC_PORT),
      username: String(process.env.MC_USERNAME),
      password: String(process.env.MC_PASSWORD),
      version: String(process.env.MC_VERSION || '1.20.1'),
      auth: process.env.MC_AUTH as
        | 'mojang'
        | 'microsoft'
        | 'offline'
        | undefined,
      onLogin: () => {
        temzinBot.setChatPattern([
          { name: 'chat', regexp: /^(?:\[[^\]]*\])<([^ :]*)> (.*)$/ },
          { name: 'whisper', regexp: /^([^ ]*) whispers: (.*)$/ },
        ]);
      },
    },
    readline,
  );

  // temzinBot.loadModule(moduleChatHi);
  temzinBot.loadModule(moduleChatAnswer);
  temzinBot.loadModule(moduleChatCountdown);
  temzinBot.loadModule(moduleChatDeath);
  temzinBot.loadModule(moduleChatGoogle);
  temzinBot.loadModule(moduleChatGemini);
  // temzinBot.loadModule(moduleChatUrlRepeat);
  temzinBot.loadModule(moduleChatWeather);
  temzinBot.loadModule(moduleChatOpenAI);
  temzinBot.loadModule(moduleChatClaude3);
}

/**
 * Readline Setup
 */
readline.setPrompt('> ');

/**
 * Readline event: send line string to bot chat
 */
readline.on('line', (line: string) => {
  temzinBot?.safechat(line);
});

/**
 * Readline event: stop process when SIGINT
 */
readline.on('SIGINT', () => {
  if (temzinBot) {
    temzinBot.log('[readline] SIGINT');
    temzinBot.log('Stopping Bot...');
    temzinBot.hasInterrupt = true;

    setTimeout(() => {
      temzinBot.instance?.quit();
      readline.close();
      process.exit();
    }, 1000);
  } else {
    console.log('[readline] SIGINT');
    process.exit();
  }
});

/**
 * System event
 */
process.on('uncaughtException', (err) => {
  /*
  if (temzinBot) {
    temzinBot.log('[error] UncaughtException: Trying reconnection 1 min later...');
    delay(60000).then(() => { start(); });
  } else {
    console.log('[error] ' + err);
  }
  */
  console.log(`[error] ${err.message}: ${err.stack}`);
});

/**
 * Call main function
 */
try {
  start();
} catch (e) {
  console.error(e);
}
