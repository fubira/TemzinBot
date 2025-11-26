/**
 * Google Gemini Chat モジュール
 */

import { GoogleGenAI } from '@google/genai';
import { createAiModule, type AiConfig, type AiProvider } from './factory';
import { CONSTANTS } from '@/config';

/**
 * Gemini設定
 */
const geminiConfig: AiConfig = {
  serviceName: 'GEMINI',
  apiKeyEnv: 'GEMINI_API_KEY',
  matchKeywordEnv: 'GEMINI_MATCH_KEYWORD',
  defaultMatchKeyword: 'temzin',
  systemRoleContentEnv: 'GEMINI_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  // Gemini用のカスタム正規表現（大文字小文字区別なし）
  customMatchRegex: (keyword: string) =>
    new RegExp(`(${keyword.toLowerCase()})\\s+(.*)\\)?`, 'i'),
};

/**
 * Geminiプロバイダー
 */
const geminiProvider: AiProvider<GoogleGenAI> = {
  init: (apiKey: string) => {
    return new GoogleGenAI({ apiKey });
  },

  callApi: async (client, question, config) => {
    const model = process.env.GEMINI_MODEL_NAME ?? 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model,
      contents: [config.systemRole, question].join('\n\n'),
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text ?? '';
  },
};

export const geminiModule = createAiModule(geminiConfig, geminiProvider);
