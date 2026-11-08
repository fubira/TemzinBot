/**
 * Open WebUI Chat モジュール
 * Open WebUI の OpenAI 互換 API 経由でローカルモデルに Web 検索付きで質問する
 */

import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import {
  createAiModule,
  keywordMatchRegex,
  todayPrompt,
  type AiConfig,
  type AiProvider,
} from './factory';
import { CONSTANTS } from '@/config';

const DEFAULT_MODEL_NAME = 'gemma4:12b';
const REQUEST_TIMEOUT_MS = 120_000;

/** OpenAI SDK の型に無い Open WebUI 固有のリクエスト項目 */
interface OpenWebUiRequestExtras {
  features: { web_search: boolean };
  // legacy 以外だと強制検索が走らず、セッションを持たない API 呼び出しでは検索されない
  params: { function_calling: 'legacy'; think: boolean };
}

/** 引用番号はチャットでは意味を持たないため取り除く */
export function removeCitationNumbers(text: string): string {
  return text.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '');
}

const openwebuiConfig: AiConfig = {
  serviceName: 'OPENWEBUI',
  apiKeyEnv: 'OPENWEBUI_API_KEY',
  matchKeywordEnv: 'OPENWEBUI_MATCH_KEYWORD',
  defaultMatchKeyword: 'temzin',
  systemRoleContentEnv: 'OPENWEBUI_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'OPENWEBUI_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'OPENWEBUI_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'OPENWEBUI_MODEL_NAME',
  defaultModelName: DEFAULT_MODEL_NAME,
  customMatchRegex: keywordMatchRegex,
};

const openwebuiProvider: AiProvider<OpenAI> = {
  init: (apiKey: string) => {
    const baseURL = process.env.OPENWEBUI_BASE_URL;
    if (!baseURL) {
      throw new Error('OPENWEBUI_BASE_URL is not set');
    }
    return new OpenAI({ apiKey, baseURL, timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 });
  },

  callApi: async (client, question, config) => {
    const body: ChatCompletionCreateParamsNonStreaming & OpenWebUiRequestExtras = {
      model: config.modelName || DEFAULT_MODEL_NAME,
      stream: false,
      messages: [
        {
          role: 'system',
          content: `${config.systemRole}\n${todayPrompt()}`,
        },
        {
          role: 'user',
          content: `${config.userPrefix}${question}${config.userPostfix}`,
        },
      ],
      features: { web_search: true },
      params: { function_calling: 'legacy', think: false },
    };

    const response = await client.chat.completions.create(body);
    const answer = response.choices[0]?.message?.content;
    return answer ? removeCitationNumbers(answer) : undefined;
  },
};

export const openwebuiModule = createAiModule(openwebuiConfig, openwebuiProvider);
