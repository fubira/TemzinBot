/**
 * Anthropic Claude Chat モジュール
 */

import Anthropic from '@anthropic-ai/sdk';
import { createAiModule, getEnvNumber, type AiConfig, type AiProvider } from './factory';
import { CONSTANTS } from '@/config';

/**
 * Claude設定
 */
const claudeConfig: AiConfig = {
  serviceName: 'CLAUDE',
  apiKeyEnv: 'CLAUDE_API_KEY',
  matchKeywordEnv: 'CLAUDE_MATCH_KEYWORD',
  defaultMatchKeyword: 'AI',
  systemRoleContentEnv: 'CLAUDE_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'CLAUDE_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'CLAUDE_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'CLAUDE_MODEL_NAME',
  defaultModelName: 'claude-sonnet-4-5-20250929',
};

/**
 * Claudeプロバイダー
 */
const claudeProvider: AiProvider<Anthropic> = {
  init: (apiKey: string) => {
    return new Anthropic({ apiKey });
  },

  callApi: async (client, question, config) => {
    const response = await client.messages.create({
      model: config.modelName || 'claude-sonnet-4-5-20250929',
      max_tokens: getEnvNumber('CLAUDE_MAX_TOKENS', 1000),
      temperature: getEnvNumber('CLAUDE_TEMPERATURE', 0),
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

export const claudeModule = createAiModule(claudeConfig, claudeProvider);
