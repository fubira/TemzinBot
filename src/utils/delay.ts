/**
 * 指定時間待機するユーティリティ関数
 */

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
