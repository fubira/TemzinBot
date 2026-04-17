/**
 * Google Gemini Chat モジュール
 */

import { GoogleGenAI } from '@google/genai';
import { createAiModule, type AiConfig, type AiProvider } from './factory';
import { CONSTANTS } from '@/config';

const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 503];

function isRetryableError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { status?: number; code?: number; message?: string };
  if (typeof e.status === 'number' && RETRYABLE_STATUS_CODES.includes(e.status)) return true;
  if (typeof e.code === 'number' && RETRYABLE_STATUS_CODES.includes(e.code)) return true;
  const msg = e.message ?? '';
  return /\b(503|500|429|UNAVAILABLE|overloaded)\b/i.test(msg);
}

async function callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < RETRY_MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err) || attempt === RETRY_MAX_ATTEMPTS - 1) {
        throw err;
      }
      const delay = RETRY_BASE_DELAY_MS * 2 ** attempt;
      console.log(
        `[GEMINI] Retryable error (attempt ${attempt + 1}/${RETRY_MAX_ATTEMPTS}), retrying in ${delay}ms:`,
        err instanceof Error ? err.message : err
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

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
    const model = process.env.GEMINI_MODEL_NAME ?? 'gemini-2.5-flash-lite';
    const useGrounding = process.env.GEMINI_USE_GROUNDING === 'true';
    const response = await callWithRetry(() =>
      client.models.generateContent({
        model,
        contents: [config.systemRole, question].join('\n\n'),
        config: useGrounding ? { tools: [{ googleSearch: {} }] } : {},
      })
    );
    return response.text ?? '';
  },
};

export const geminiModule = createAiModule(geminiConfig, geminiProvider);
