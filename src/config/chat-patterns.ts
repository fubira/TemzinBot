/**
 * チャットパターンの定義
 */

export const CHAT_PATTERNS: Array<{ name: string; regexp: RegExp }> = [
  {
    name: 'chat',
    regexp: /^(?:\[[^\]]*\])<([^ :]*)> (.*)$/,
  },
  {
    name: 'whisper',
    regexp: /^([^ ]*) whispers: (.*)$/,
  },
];
