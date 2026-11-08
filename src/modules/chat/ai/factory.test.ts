import { describe, expect, test } from 'bun:test';
import { keywordMatchRegex, removeBlankLines, todayPrompt } from './factory';

describe('removeBlankLines', () => {
  test('removes blank lines and trims each line', () => {
    expect(removeBlankLines('一行目\n\n  二行目  \n')).toBe('一行目\n二行目');
  });
});

describe('keywordMatchRegex', () => {
  test('matches the keyword case-insensitively and captures the question', () => {
    expect('Temzin 今日の天気'.match(keywordMatchRegex('temzin'))?.[2]).toBe('今日の天気');
  });

  test('does not match the keyword without a following question', () => {
    expect('temzin'.match(keywordMatchRegex('temzin'))).toBeNull();
  });
});

describe('todayPrompt', () => {
  test('uses the JST date across the UTC day boundary', () => {
    expect(todayPrompt(new Date('2026-11-08T15:00:00Z'))).toBe('今日の日付は2026年11月9日です。');
    expect(todayPrompt(new Date('2026-11-08T14:59:59Z'))).toBe('今日の日付は2026年11月8日です。');
  });
});
