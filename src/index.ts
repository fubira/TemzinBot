import 'dotenv/config';
import * as Readline from 'node:readline';
import TemzinBot from '@/temzinbot';

// Constants
const DEFAULT_MC_VERSION = '1.21.4';
const SIGINT_TIMEOUT_MS = 1000;
const RECONNECTION_DELAY_MS = 60000;

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// import moduleChatHi from 'temzinbot/modules/module-chat-hi'; // For simple response testing
import moduleChatAnswer from '@/temzinbot/modules/module-chat-answer';
import moduleChatClaude3 from '@/temzinbot/modules/module-chat-claude3';
import moduleChatCountdown from '@/temzinbot/modules/module-chat-countdown';
import moduleChatDeath from '@/temzinbot/modules/module-chat-death';
import moduleChatGemini from '@/temzinbot/modules/module-chat-gemini';
import moduleChatGoogle from '@/temzinbot/modules/module-chat-google';
import moduleChatOpenAI from '@/temzinbot/modules/module-chat-openai';
import moduleChatWeather from '@/temzinbot/modules/module-chat-weather';

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
let temzinBot: TemzinBot | undefined;

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
      version: String(process.env.MC_VERSION || DEFAULT_MC_VERSION),
      auth: process.env.MC_AUTH as 'mojang' | 'microsoft' | 'offline' | undefined,
      onLogin: () => {
        temzinBot?.setChatPattern([
          { name: 'chat', regexp: /^(?:\[[^\]]*\])<([^ :]*)> (.*)$/ },
          { name: 'whisper', regexp: /^([^ ]*) whispers: (.*)$/ },
        ]);
      },
    },
    readline
  );

  // temzinBot.loadModule(moduleChatHi); // Enable for simple response testing
  temzinBot.loadModule(moduleChatAnswer);
  temzinBot.loadModule(moduleChatCountdown);
  temzinBot.loadModule(moduleChatDeath);
  temzinBot.loadModule(moduleChatGoogle);
  temzinBot.loadModule(moduleChatGemini);
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

    const bot = temzinBot;
    setTimeout(() => {
      bot.instance?.quit();
      readline.close();
      process.exit();
    }, SIGINT_TIMEOUT_MS);
  } else {
    console.log('[readline] SIGINT');
    process.exit();
  }
});

/**
 * System event
 */
process.on('uncaughtException', (err) => {
  if (temzinBot) {
    temzinBot.log(`[error] UncaughtException: ${err.message} - ${err.stack}`);
    temzinBot.log(`[error] Trying reconnection ${RECONNECTION_DELAY_MS / 1000} seconds later...`);
    temzinBot.instance?.quit(); // 現在のインスタンスを停止
    delay(RECONNECTION_DELAY_MS)
      .then(() => {
        temzinBot?.log('[system] Attempting to restart bot...');
        start();
      })
      .catch((restartError) => {
        console.error('[error] Failed to restart bot after delay:', restartError);
        process.exit(1); // 再起動にも失敗したら終了
      });
  } else {
    console.log(`[error] UncaughtException (bot not initialized): ${err.message} - ${err.stack}`);
    process.exit(1); // ボット未初期化時のエラーは終了
  }
});

/**
 * Call main function
 */
try {
  start();
} catch (e) {
  console.error(e);
}
