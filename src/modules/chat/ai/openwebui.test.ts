import { describe, expect, test } from 'bun:test';
import { removeCitationNumbers } from './openwebui';

describe('removeCitationNumbers', () => {
  test('removes citation numbers', () => {
    expect(removeCitationNumbers('最新は26.3です [1]。発売は未定です[2, 3]。')).toBe(
      '最新は26.3です。発売は未定です。'
    );
  });

  test('keeps brackets that are not citation numbers', () => {
    expect(removeCitationNumbers('[注意] 配列 a[i] です')).toBe('[注意] 配列 a[i] です');
  });

  test('returns an empty string when only citations remain', () => {
    expect(removeCitationNumbers('[1]')).toBe('');
  });
});
