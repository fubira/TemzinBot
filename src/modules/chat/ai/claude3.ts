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
  apiKeyEnv: 'ANTHROPIC_API_KEY',
  matchKeywordEnv: 'ANTHROPIC_MATCH_KEYWORD',
  defaultMatchKeyword: 'AI',
  systemRoleContentEnv: 'ANTHROPIC_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'ANTHROPIC_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'ANTHROPIC_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'ANTHROPIC_MODEL_NAME',
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
      max_tokens: getEnvNumber('ANTHROPIC_MAX_TOKENS', 1000),
      temperature: getEnvNumber('ANTHROPIC_TEMPERATURE', 0),
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
