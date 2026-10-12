// Ranking in one breath:
//
//   score = 0.50 * recency + 0.25 * affinity + 0.20 * engagement + 0.05 * media
//
// Every feature is between 0 and 1. The same inputs also produce the short reasons shown under
// "Why am I seeing this?", so the explanation is the calculation and not a story told afterwards.

export type Relation = 'self' | 'mutual' | 'following' | 'community' | 'none';

export interface RankFeatures {
  ageHours: number;
  relation: Relation;
  // reactions plus replies
  engagement: number;
  hasMedia: boolean;
}

export const WEIGHTS = { recency: 0.5, affinity: 0.25, engagement: 0.2, media: 0.05 } as const;

const HALF_LIFE_HOURS = 12;
const ENGAGEMENT_SATURATION = 50;
const AFFINITY: Record<Relation, number> = {
  mutual: 1,
  following: 0.7,
  self: 0.5,
  community: 0.4,
  none: 0,
};

// Halves every 12 hours.
export const recency = (ageHours: number) => 0.5 ** (Math.max(ageHours, 0) / HALF_LIFE_HOURS);

// Grows quickly at first and flattens out: the 50th reaction matters much less than the 5th.
export const engagementScore = (count: number) =>
  Math.min(1, Math.log1p(Math.max(count, 0)) / Math.log1p(ENGAGEMENT_SATURATION));

export function score(features: RankFeatures): number {
  return (
    WEIGHTS.recency * recency(features.ageHours) +
    WEIGHTS.affinity * AFFINITY[features.relation] +
    WEIGHTS.engagement * engagementScore(features.engagement) +
    (features.hasMedia ? WEIGHTS.media : 0)
  );
}

export interface ReasonContext {
  authorHandle: string;
  communityName?: string;
  mentionsViewer: boolean;
}

const MAX_REASONS = 3;

// The biggest contributors to the score, as sentences, strongest first.
export function explain(features: RankFeatures, context: ReasonContext): string[] {
  const reasons: { text: string; weight: number }[] = [];
  const affinity = WEIGHTS.affinity * AFFINITY[features.relation];

  if (context.mentionsViewer) reasons.push({ text: 'It mentions you', weight: 1 });
  switch (features.relation) {
    case 'self':
      reasons.push({ text: 'You wrote this', weight: affinity });
      break;
    case 'mutual':
      reasons.push({
        text: `You and @${context.authorHandle} follow each other`,
        weight: affinity,
      });
      break;
    case 'following':
      reasons.push({ text: `You follow @${context.authorHandle}`, weight: affinity });
      break;
    case 'community':
      reasons.push({
        text: context.communityName
          ? `From ${context.communityName}, a community you joined`
          : 'From a community you joined',
        weight: affinity,
      });
      break;
    case 'none':
      break;
  }

  const engagement = WEIGHTS.engagement * engagementScore(features.engagement);
  if (engagement >= 0.08) {
    reasons.push({
      text: context.communityName
        ? `Popular in ${context.communityName}`
        : 'Getting a lot of reactions',
      weight: engagement,
    });
  }
  const fresh = WEIGHTS.recency * recency(features.ageHours);
  if (fresh >= 0.35) reasons.push({ text: 'Posted recently', weight: fresh });
  if (features.hasMedia) reasons.push({ text: 'Has photos', weight: WEIGHTS.media });

  return reasons
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_REASONS)
    .map((reason) => reason.text);
}
