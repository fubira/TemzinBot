/**
 * AIモジュールファクトリー
 * 共通ロジックを抽出し、各AIプロバイダー固有の処理はアダプターとして分離
 */

import type { BotInstance } from '@/core';
import { onUserChat } from '@/utils';

interface EnvProvider {
  get(key: string): string | undefined;
}

const defaultEnvProvider: EnvProvider = {
  get: (key: string) => process.env[key],
};

/**
 * 環境変数から数値を取得するヘルパー関数
 */
export function getEnvNumber(
  key: string,
  defaultValue: number,
  envProvider: EnvProvider = defaultEnvProvider
): number {
  const value = envProvider.get(key);
  return value ? Number(value) : defaultValue;
}

/**
 * 環境変数から文字列を取得するヘルパー関数
 */
function getEnvOrDefault(
  envKey: string | undefined,
  defaultValue: string | undefined,
  envProvider: EnvProvider
): string {
  if (!envKey) {
    return defaultValue || '';
  }
  return envProvider.get(envKey) || defaultValue || '';
}

/**
 * AI設定インターフェイス
 */
export interface AiConfig {
  /** サービス名（ログ用） */
  serviceName: string;
  /** APIキー環境変数名 */
  apiKeyEnv: string;
  /** マッチキーワード環境変数名 */
  matchKeywordEnv: string;
  /** デフォルトマッチキーワード */
  defaultMatchKeyword: string;
  /** システムロール環境変数名 */
  systemRoleContentEnv: string;
  /** デフォルトシステムロール */
  defaultSystemRoleContent: string;
  /** ユーザーロールプレフィックス環境変数名 */
  userRoleContentPrefixEnv?: string;
  /** ユーザーロールポストフィックス環境変数名 */
  userRoleContentPostfixEnv?: string;
  /** デフォルトユーザーロールポストフィックス */
  defaultUserRoleContentPostfix?: string;
  /** モデル名環境変数名 */
  modelNameEnv?: string;
  /** デフォルトモデル名 */
  defaultModelName?: string;
  /** カスタムマッチ正規表現（省略時は標準パターン） */
  customMatchRegex?: (keyword: string) => RegExp;
}

/**
 * AIプロバイダーアダプター
 */
export interface AiProvider<TClient = unknown> {
  /**
   * クライアントの初期化
   */
  init: (apiKey: string, config: Record<string, unknown>) => TClient;

  /**
   * API呼び出し
   * @returns 回答テキスト、取得できない場合はundefined
   */
  callApi: (
    client: TClient,
    question: string,
    config: {
      systemRole: string;
      userPrefix: string;
      userPostfix: string;
      modelName?: string;
      [key: string]: unknown;
    }
  ) => Promise<string | undefined>;
}

/**
 * AIモジュールを作成するファクトリー関数
 */
export function createAiModule<TClient>(
  config: AiConfig,
  provider: AiProvider<TClient>,
  envProvider: EnvProvider = defaultEnvProvider
) {
  return (bot: BotInstance) => {
    let isApiCalling = false;

    const apiKey = envProvider.get(config.apiKeyEnv);
    const matchKeyword =
      envProvider.get(config.matchKeywordEnv) || config.defaultMatchKeyword;
    const systemRoleContent =
      envProvider.get(config.systemRoleContentEnv) || config.defaultSystemRoleContent;
    const userRoleContentPrefix = getEnvOrDefault(
      config.userRoleContentPrefixEnv,
      undefined,
      envProvider
    );
    const userRoleContentPostfix = getEnvOrDefault(
      config.userRoleContentPostfixEnv,
      config.defaultUserRoleContentPostfix,
      envProvider
    );
    const modelName = getEnvOrDefault(config.modelNameEnv, config.defaultModelName, envProvider);

    // APIキーチェック
    if (!apiKey) {
      bot.log(`[${config.serviceName}] No apikey found.`);
      return;
    }

    // 設定をログ出力
    bot.log(
      `[${config.serviceName}] Initialized with keyword: ${matchKeyword}, model: ${modelName || 'default'}`
    );

    // クライアント初期化
    const client = provider.init(apiKey, { modelName });

    // チャットイベントハンドラー
    onUserChat(bot, async (_username, message) => {
      // キーワードマッチング
      const regex = config.customMatchRegex
        ? config.customMatchRegex(matchKeyword)
        : new RegExp(`\\b(${matchKeyword})\\b\\s+(.*?)(?:\\)|$)`);

      const match = message.match(regex);

      if (!match) {
        return;
      }
      const content = match[2]?.replace(/\)?$/, '').trim() ?? '';
      if (!content) {
        bot.chat.send(`[${config.serviceName}] 内容がないようです。`);
        return;
      }
      // 同時呼び出し制御
      if (isApiCalling) {
        bot.chat.send(
          `[${config.serviceName}] 前の質問の処理中です。しばらくお待ちください。`
        );
        return;
      }
      try {
        isApiCalling = true;
        bot.log(`[${config.serviceName}]`, `Q: ${content}`);

        // API呼び出し（プロバイダー固有）
        const answer = await provider.callApi(client, content, {
          systemRole: systemRoleContent,
          userPrefix: userRoleContentPrefix,
          userPostfix: userRoleContentPostfix,
          modelName,
        });

        if (answer) {
          bot.log(`[${config.serviceName}]`, `A: ${answer}`);
          bot.chat.send(answer);
        } else {
          bot.chat.send(`[${config.serviceName}] 回答を取得できませんでした。`);
        }
      } catch (err) {
        bot.chat.send(`[${config.serviceName}] APIの呼び出し中にエラーが起きました。`);
        bot.log(`[${config.serviceName}] API error:`, err);
      } finally {
        isApiCalling = false;
        bot.log(`[${config.serviceName}]`, `chat complete.`);
      }
    });
  };
}
