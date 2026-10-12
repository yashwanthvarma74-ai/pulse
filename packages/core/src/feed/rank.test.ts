import { describe, expect, it } from 'vitest';
import { engagementScore, explain, recency, score, WEIGHTS, type RankFeatures } from './rank';

const base: RankFeatures = { ageHours: 0, relation: 'none', engagement: 0, hasMedia: false };

describe('recency', () => {
  it('is 1 for a post made now and halves every 12 hours', () => {
    expect(recency(0)).toBe(1);
    expect(recency(12)).toBeCloseTo(0.5);
    expect(recency(24)).toBeCloseTo(0.25);
  });

  it('never goes negative or above 1, even for a clock that is slightly ahead', () => {
    expect(recency(-3)).toBe(1);
    expect(recency(10_000)).toBeGreaterThanOrEqual(0);
  });
});

describe('engagementScore', () => {
  it('is 0 for nothing, grows with diminishing returns and caps at 1', () => {
    expect(engagementScore(0)).toBe(0);
    expect(engagementScore(5) - engagementScore(0)).toBeGreaterThan(
      engagementScore(50) - engagementScore(45),
    );
    expect(engagementScore(50)).toBeCloseTo(1);
    expect(engagementScore(5000)).toBe(1);
  });
});

describe('score', () => {
  it('stays between 0 and 1 and the weights add up to 1', () => {
    expect(WEIGHTS.recency + WEIGHTS.affinity + WEIGHTS.engagement + WEIGHTS.media).toBeCloseTo(1);
    const best = score({ ageHours: 0, relation: 'mutual', engagement: 1000, hasMedia: true });
    expect(best).toBeLessThanOrEqual(1);
    expect(score({ ...base, ageHours: 10_000 })).toBeGreaterThanOrEqual(0);
  });

  it('prefers a person you follow to a stranger, all else equal', () => {
    expect(score({ ...base, relation: 'following' })).toBeGreaterThan(score(base));
    expect(score({ ...base, relation: 'mutual' })).toBeGreaterThan(
      score({ ...base, relation: 'following' }),
    );
  });

  it('lets a popular older post beat a quiet newer one from the same kind of source', () => {
    const quietNew = score({ ...base, ageHours: 1, relation: 'following' });
    const popularOld = score({ ...base, ageHours: 6, relation: 'following', engagement: 40 });
    expect(popularOld).toBeGreaterThan(quietNew);
  });

  it('gives a small bump for photos', () => {
    expect(score({ ...base, hasMedia: true }) - score(base)).toBeCloseTo(WEIGHTS.media);
  });
});

describe('explain', () => {
  const context = { authorHandle: 'mayachen', mentionsViewer: false };

  it('says why a followed author is there', () => {
    expect(explain({ ...base, relation: 'following' }, context)).toContain('You follow @mayachen');
  });

  it('puts a mention first', () => {
    const reasons = explain(
      { ...base, relation: 'following' },
      { ...context, mentionsViewer: true },
    );
    expect(reasons[0]).toBe('It mentions you');
  });

  it('names the community, and calls a busy community post popular', () => {
    const reasons = explain(
      { ageHours: 30, relation: 'community', engagement: 30, hasMedia: false },
      { ...context, communityName: 'Photography' },
    );
    expect(reasons).toContain('From Photography, a community you joined');
    expect(reasons).toContain('Popular in Photography');
  });

  it('gives at most three reasons, strongest first', () => {
    const reasons = explain(
      { ageHours: 0.5, relation: 'mutual', engagement: 50, hasMedia: true },
      { ...context, communityName: 'Photography', mentionsViewer: true },
    );
    expect(reasons).toHaveLength(3);
    expect(reasons[0]).toBe('It mentions you');
  });

  it('has nothing to say about an old, quiet post from a stranger', () => {
    expect(explain({ ...base, ageHours: 400 }, context)).toEqual([]);
  });
});
