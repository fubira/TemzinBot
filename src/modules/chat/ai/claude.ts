/**
 * Anthropic Claude Chat モジュール
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  createAiModule,
  getEnvNumber,
  keywordMatchRegex,
  todayPrompt,
  type AiConfig,
  type AiProvider,
} from './factory';
import { CONSTANTS } from '@/config';

const DEFAULT_MODEL_NAME = 'claude-haiku-5-5';
// 思考分も含む上限。回答の長さはプロンプトで指定する
const DEFAULT_MAX_TOKENS = 16000;
const WEB_SEARCH_MAX_USES = 3;

/**
 * 応答からチャットに送る回答を取り出す
 * 検索前の前置きを除くため、最後の検索結果より後のテキストだけを使う。
 * 検索結果を使った回答には出典の表示が必要なので URL を添える。
 */
// ponytail: stop_reason が pause_turn の応答は再開せず、回答なしとして扱う。max_uses が小さいので発生は稀
export function extractAnswer(content: Anthropic.ContentBlock[]): string | undefined {
  const lastSearchIndex = content.map((b) => b.type).lastIndexOf('web_search_tool_result');
  const textBlocks = content
    .slice(lastSearchIndex + 1)
    .filter((b): b is Anthropic.TextBlock => b.type === 'text');

  const answer = textBlocks
    .map((b) => b.text)
    .join('')
    .trim();
  if (!answer) return undefined;

  const urls = new Set(
    textBlocks
      .flatMap((b) => b.citations ?? [])
      .flatMap((c) => (c.type === 'web_search_result_location' ? [c.url] : []))
  );
  return [answer, ...[...urls].map((url) => `出典: ${url}`)].join('\n');
}

/**
 * Claude設定
 */
const claudeConfig: AiConfig = {
  serviceName: 'CLAUDE',
  apiKeyEnv: 'CLAUDE_API_KEY',
  matchKeywordEnv: 'CLAUDE_MATCH_KEYWORD',
  defaultMatchKeyword: 'temzin',
  systemRoleContentEnv: 'CLAUDE_SYSTEM_ROLE_CONTENT',
  defaultSystemRoleContent: CONSTANTS.AI_DEFAULTS.SYSTEM_ROLE,
  userRoleContentPrefixEnv: 'CLAUDE_USER_ROLE_CONTENT_PREFIX',
  userRoleContentPostfixEnv: 'CLAUDE_USER_ROLE_CONTENT_POSTFIX',
  defaultUserRoleContentPostfix: CONSTANTS.AI_DEFAULTS.USER_POSTFIX,
  modelNameEnv: 'CLAUDE_MODEL_NAME',
  defaultModelName: DEFAULT_MODEL_NAME,
  customMatchRegex: keywordMatchRegex,
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
      model: config.modelName || DEFAULT_MODEL_NAME,
      max_tokens: getEnvNumber('CLAUDE_MAX_TOKENS', DEFAULT_MAX_TOKENS),
      system: `${config.systemRole}\n${todayPrompt()}`,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: WEB_SEARCH_MAX_USES,
          user_location: { type: 'approximate', country: 'JP', timezone: 'Asia/Tokyo' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `${config.userPrefix}${question}${config.userPostfix}`,
        },
      ],
    });

    return extractAnswer(response.content);
  },
};

export const claudeModule = createAiModule(claudeConfig, claudeProvider);
