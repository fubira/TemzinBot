/**
 * Google Gemini Chat モジュール
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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
const geminiProvider: AiProvider<GoogleGenerativeAI> = {
  init: (apiKey: string) => {
    return new GoogleGenerativeAI(apiKey);
  },

  callApi: async (client, question, config) => {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent([config.systemRole, question]);
    const response = result.response;
    return response.text();
  },
};

export const geminiModule = createAiModule(geminiConfig, geminiProvider);
