/**
 * Anthropic Claude 3 Chat モジュール
 */

import Anthropic from '@anthropic-ai/sdk';
import { createAiModule, getEnvNumber, type AiConfig, type AiProvider } from './factory';
import { CONSTANTS } from '@/config';

/**
 * Claude3設定
 */
const claude3Config: AiConfig = {
  serviceName: 'CLAUDE3',
  apiKeyEnv: 'CLAUDE3_API_KEY',
  matchKeywordEnv: 'CLAUDE3_MATCH_KEYWORD',
  defaultMatchKeyword: 'AI',
  systemRoleContentEnv: 'CLAUDE3_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'CLAUDE3_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'CLAUDE3_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'CLAUDE3_MODEL_NAME',
  defaultModelName: 'claude-3-5-sonnet-latest',
};

/**
 * Claude3プロバイダー
 */
const claude3Provider: AiProvider<Anthropic> = {
  init: (apiKey: string) => {
    return new Anthropic({ apiKey });
  },

  callApi: async (client, question, config) => {
    const response = await client.messages.create({
      model: config.modelName || 'claude-3-5-sonnet-latest',
      max_tokens: getEnvNumber('CLAUDE3_MAX_TOKENS', 1000),
      temperature: getEnvNumber('CLAUDE3_TEMPERATURE', 0),
      system: config.systemRole,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${config.userPrefix}${question}${config.userPostfix}`,
            },
          ],
        },
      ],
    });

    return response.content.find((c) => c.type === 'text')?.text;
  },
};

export const claude3Module = createAiModule(claude3Config, claude3Provider);
