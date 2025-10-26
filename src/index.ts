import 'dotenv/config';
import * as Readline from 'node:readline';
import { TemzinBot } from '@/core';
import { CONSTANTS } from '@/config/constants';
import { CHAT_PATTERNS } from '@/config/chat-patterns';
import { getMinecraftConfig } from '@/config/minecraft';
import { delay } from '@/utils';
import {
  answerModule,
  claude3Module,
  countdownModule,
  deathModule,
  geminiModule,
  googleModule,
  openaiModule,
  weatherModule,
} from '@/modules';

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
  const config = getMinecraftConfig();
  temzinBot = new TemzinBot();
  temzinBot.createBot(
    {
      ...config,
      onLogin: () => {
        temzinBot?.setChatPattern(CHAT_PATTERNS);
      },
    },
    readline
  );

  // Load modules
  temzinBot.loadModule(answerModule);
  temzinBot.loadModule(countdownModule);
  temzinBot.loadModule(deathModule);
  temzinBot.loadModule(googleModule);
  temzinBot.loadModule(geminiModule);
  temzinBot.loadModule(weatherModule);
  temzinBot.loadModule(openaiModule);
  temzinBot.loadModule(claude3Module);
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
    }, CONSTANTS.SIGINT_TIMEOUT_MS);
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
    temzinBot.log(
      `[error] Trying reconnection ${CONSTANTS.RECONNECTION_DELAY_MS / 1000} seconds later...`
    );
    temzinBot.instance?.quit(); // 現在のインスタンスを停止
    delay(CONSTANTS.RECONNECTION_DELAY_MS)
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
