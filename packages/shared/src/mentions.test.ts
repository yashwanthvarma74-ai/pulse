import { describe, expect, it } from 'vitest';
import { extractMentions, splitMentions } from './mentions';

describe('extractMentions', () => {
  it('finds handles, lowercases them and removes repeats', () => {
    expect(extractMentions('Thanks @MayaChen and @daniel_o, and again @mayachen!')).toEqual([
      'mayachen',
      'daniel_o',
    ]);
  });

  it('ignores email addresses and handles that are too short', () => {
    expect(extractMentions('write to team@example.com or @ab')).toEqual([]);
  });

  it('finds a handle at the start, after punctuation and on a new line', () => {
    expect(extractMentions('@alice\n(@bob) hi')).toEqual(['alice', 'bob']);
  });
});

describe('splitMentions', () => {
  it('splits text around mentions and keeps every character', () => {
    const text = 'Hi @alice, meet @bob.';
    const parts = splitMentions(text);
    expect(parts.map((p) => p.text).join('')).toBe(text);
    expect(parts.filter((p) => p.mention).map((p) => p.mention)).toEqual(['alice', 'bob']);
  });

  it('returns one part when there is no mention', () => {
    expect(splitMentions('nothing here')).toEqual([{ text: 'nothing here' }]);
  });
});
