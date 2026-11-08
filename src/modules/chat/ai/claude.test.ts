import { describe, expect, test } from 'bun:test';
import type Anthropic from '@anthropic-ai/sdk';
import { extractAnswer } from './claude';

const text = (value: string, urls: string[] = []) =>
  ({
    type: 'text',
    text: value,
    citations: urls.map((url) => ({ type: 'web_search_result_location', url })),
  }) as unknown as Anthropic.ContentBlock;

const searchResult = { type: 'web_search_tool_result' } as unknown as Anthropic.ContentBlock;

describe('extractAnswer', () => {
  test('returns plain text when no search ran', () => {
    expect(extractAnswer([text('こんにちは')])).toBe('こんにちは');
  });

  test('drops text before the last search result', () => {
    expect(extractAnswer([text('検索します'), searchResult, text('答えです')])).toBe('答えです');
  });

  test('joins split text blocks and appends unique citation urls', () => {
    const content = [
      searchResult,
      text('最新は', ['https://example.com/a']),
      text('26.3です', ['https://example.com/a', 'https://example.com/b']),
    ];
    expect(extractAnswer(content)).toBe(
      '最新は26.3です\n出典: https://example.com/a\n出典: https://example.com/b'
    );
  });

  test('returns undefined when no text follows the search', () => {
    expect(extractAnswer([text('検索します'), searchResult])).toBeUndefined();
  });

  test('returns undefined for empty content', () => {
    expect(extractAnswer([])).toBeUndefined();
  });
});
