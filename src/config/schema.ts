import { z, ZodError } from 'zod';

/**
 * 環境変数スキーマ定義
 * 起動時に全環境変数を一括検証し、型安全性を確保する
 */
const envSchema = z.object({
  // Minecraft接続設定（必須）
  MC_HOST: z.string().min(1, 'MC_HOST must not be empty'),
  MC_PORT: z
    .string()
    .regex(/^\d+$/, 'MC_PORT must be a valid number')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 65535, 'MC_PORT must be between 1 and 65535'),
  MC_USERNAME: z
    .string()
    .min(1, 'MC_USERNAME must not be empty')
    .max(16, 'MC_USERNAME must be 16 characters or less'),

  // Minecraft接続設定（オプション）
  MC_VERSION: z.string().optional(),
  MC_AUTH: z.enum(['mojang', 'microsoft', 'offline']).optional(),

  // Claude 3 AI設定
  CLAUDE3_API_KEY: z.string().optional(),
  CLAUDE3_MATCH_KEYWORD: z.string().optional(),
  CLAUDE3_SYSTEM_ROLE_CONTENT: z.string().optional(),
  CLAUDE3_USER_ROLE_CONTENT_PREFIX: z.string().optional(),
  CLAUDE3_USER_ROLE_CONTENT_POSTFIX: z.string().optional(),
  CLAUDE3_MODEL_NAME: z.string().optional(),

  // Gemini AI設定
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MATCH_KEYWORD: z.string().optional(),
  GEMINI_SYSTEM_ROLE_CONTENT: z.string().optional(),
  GEMINI_USER_ROLE_CONTENT_PREFIX: z.string().optional(),
  GEMINI_USER_ROLE_CONTENT_POSTFIX: z.string().optional(),
  GEMINI_MODEL_NAME: z.string().optional(),

  // OpenAI設定
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MATCH_KEYWORD: z.string().optional(),
  OPENAI_SYSTEM_ROLE_CONTENT: z.string().optional(),
  OPENAI_USER_ROLE_CONTENT_PREFIX: z.string().optional(),
  OPENAI_USER_ROLE_CONTENT_POSTFIX: z.string().optional(),
  OPENAI_MODEL_NAME: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数を検証し、型安全な設定オブジェクトを返す
 * @throws {Error} 検証に失敗した場合、詳細なエラーメッセージと共にスロー
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map(
        (err) => `  - ${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment variable validation failed:\n${messages.join('\n')}`
      );
    }
    throw error;
  }
}
