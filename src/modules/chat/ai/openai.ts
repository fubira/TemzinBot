/**
 * OpenAI Chat モジュール
 */

import OpenAI from 'openai';
import { createAiModule, type AiConfig, type AiProvider } from './factory';
import { CONSTANTS } from '@/config';

/**
 * OpenAI設定
 */
const openaiConfig: AiConfig = {
  serviceName: 'OPENAI',
  apiKeyEnv: 'OPENAI_API_KEY',
  matchKeywordEnv: 'OPENAI_MATCH_KEYWORD',
  defaultMatchKeyword: 'AI',
  systemRoleContentEnv: 'OPENAI_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'OPENAI_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'OPENAI_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'OPENAI_MODEL_NAME',
  defaultModelName: 'gpt-4o-mini-search-preview',
};

/**
 * OpenAIプロバイダー
 */
const openaiProvider: AiProvider<OpenAI> = {
  init: (apiKey: string) => {
    return new OpenAI({ apiKey });
  },

  callApi: async (client, question, config) => {
    const response = await client.chat.completions.create({
      model: config.modelName || 'gpt-4o-mini-search-preview',
      messages: [
        {
          role: 'system',
          content: config.systemRole,
        },
        {
          role: 'user',
          content: `${config.userPrefix}${question}${config.userPostfix}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || undefined;
  },
};

export const openaiModule = createAiModule(openaiConfig, openaiProvider);
