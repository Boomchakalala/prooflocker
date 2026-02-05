/**
 * User Scoring System
 *
 * Two parallel systems:
 * 1. Total Points (cumulative, never decreases) - for airdrops
 * 2. Reliability Score (0-1000, recalculated) - for reputation
 */

export interface UserStats {
  // Points (cumulative)
  totalPoints: number;

  // Reliability Score components
  totalPredictions: number;
  resolvedPredictions: number;
  correctPredictions: number;
  incorrectPredictions: number;
  avgEvidenceScore: number;

  // Calculated
  winRate: number;
  reliabilityScore: number;
  tier: ReliabilityTier;
}

export type ReliabilityTier = 'novice' | 'trusted' | 'expert' | 'master' | 'legend';

/**
 * Points awarded for actions
 */
export const POINTS_CONFIG = {
  // Lock prediction
  LOCK_BASE: 10,
  LOCK_EARLY_BONUS: 5, // >30 days before resolution

  // Resolve prediction
  RESOLVE_CORRECT_BASE: 50,
  RESOLVE_INCORRECT_PENALTY: -30,
  RESOLVE_ONCHAIN_BONUS: 20,

  // Evidence multiplier applied to RESOLVE_CORRECT_BASE
  // evidence_score (0-100) converted to multiplier (0.5x - 1.5x)
};

/**
 * Reliability Score tiers
 */
export const RELIABILITY_TIERS = {
  legend: { min: 800, label: 'Legend', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  master: { min: 650, label: 'Master', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  expert: { min: 500, label: 'Expert', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  trusted: { min: 300, label: 'Trusted', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  novice: { min: 0, label: 'Novice', color: 'text-neutral-400', bgColor: 'bg-neutral-500/10' },
};

/**
 * Calculate points for locking a prediction
 */
export function calculateLockPoints(isEarlyPrediction: boolean): number {
  let points = POINTS_CONFIG.LOCK_BASE;

  if (isEarlyPrediction) {
    points += POINTS_CONFIG.LOCK_EARLY_BONUS;
  }

  return points;
}

/**
 * Calculate points for resolving a prediction
 */
export function calculateResolvePoints(
  isCorrect: boolean,
  evidenceScore: number,
  isOnChain: boolean
): number {
  if (!isCorrect) {
    return POINTS_CONFIG.RESOLVE_INCORRECT_PENALTY;
  }

  // Evidence multiplier: 0.5x (score=0) to 1.5x (score=100)
  const evidenceMultiplier = (evidenceScore / 100) + 0.5;

  let points = POINTS_CONFIG.RESOLVE_CORRECT_BASE * evidenceMultiplier;

  if (isOnChain) {
    points += POINTS_CONFIG.RESOLVE_ONCHAIN_BONUS;
  }

  return Math.round(points);
}

/**
 * Calculate Reliability Score (0-1000)
 */
export function calculateReliabilityScore(stats: {
  correctPredictions: number;
  incorrectPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number;
}): number {
  const { correctPredictions, incorrectPredictions, resolvedPredictions, avgEvidenceScore } = stats;

  if (resolvedPredictions === 0) {
    return 0;
  }

  // 1. Accuracy Score (40% weight) - 0-400 points
  const winRate = correctPredictions / resolvedPredictions;
  const accuracyScore = winRate * 400;

  // 2. Evidence Quality (30% weight) - 0-300 points
  const evidenceScore = (avgEvidenceScore / 100) * 300;

  // 3. Volume Multiplier (20% weight) - 0-200 points
  let volumeScore = 0;
  if (resolvedPredictions <= 5) {
    volumeScore = resolvedPredictions * 40;
  } else if (resolvedPredictions <= 20) {
    volumeScore = 200 + (resolvedPredictions - 5) * 5;
  } else {
    volumeScore = 275 + Math.min((resolvedPredictions - 20) * 2, 125);
  }
  volumeScore = Math.min(volumeScore, 200);

  // 4. Consistency Bonus (10% weight) - 0-100 points
  // Award points for having balanced evidence + accuracy
  const hasGoodEvidence = avgEvidenceScore >= 50;
  const hasGoodAccuracy = winRate >= 0.6;
  let consistencyBonus = 0;
  if (hasGoodEvidence && hasGoodAccuracy && resolvedPredictions >= 5) {
    consistencyBonus = Math.min(resolvedPredictions * 5, 100);
  }

  const totalScore = accuracyScore + evidenceScore + volumeScore + consistencyBonus;

  return Math.min(Math.round(totalScore), 1000);
}

/**
 * Get reliability tier from score
 */
export function getReliabilityTier(score: number): ReliabilityTier {
  if (score >= RELIABILITY_TIERS.legend.min) return 'legend';
  if (score >= RELIABILITY_TIERS.master.min) return 'master';
  if (score >= RELIABILITY_TIERS.expert.min) return 'expert';
  if (score >= RELIABILITY_TIERS.trusted.min) return 'trusted';
  return 'novice';
}

/**
 * Get tier info for display
 */
export function getTierInfo(tier: ReliabilityTier) {
  return RELIABILITY_TIERS[tier];
}

/**
 * Get next tier milestone
 */
export function getNextTierMilestone(currentScore: number): {
  nextTier: ReliabilityTier | null;
  pointsNeeded: number;
  tierInfo: typeof RELIABILITY_TIERS[ReliabilityTier] | null;
} {
  const tiers = Object.entries(RELIABILITY_TIERS).sort((a, b) => b[1].min - a[1].min);

  for (const [tierKey, tierData] of tiers) {
    if (currentScore < tierData.min) {
      return {
        nextTier: tierKey as ReliabilityTier,
        pointsNeeded: tierData.min - currentScore,
        tierInfo: tierData,
      };
    }
  }

  return {
    nextTier: null,
    pointsNeeded: 0,
    tierInfo: null,
  };
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get score breakdown for transparency
 */
export function getScoreBreakdown(stats: {
  correctPredictions: number;
  incorrectPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number;
}): Array<{ label: string; value: number; maxValue: number }> {
  const { correctPredictions, resolvedPredictions, avgEvidenceScore } = stats;

  if (resolvedPredictions === 0) {
    return [];
  }

  const winRate = correctPredictions / resolvedPredictions;
  const accuracyScore = Math.round(winRate * 400);
  const evidenceScore = Math.round((avgEvidenceScore / 100) * 300);

  let volumeScore = 0;
  if (resolvedPredictions <= 5) {
    volumeScore = resolvedPredictions * 40;
  } else if (resolvedPredictions <= 20) {
    volumeScore = 200 + (resolvedPredictions - 5) * 5;
  } else {
    volumeScore = 275 + Math.min((resolvedPredictions - 20) * 2, 125);
  }
  volumeScore = Math.min(volumeScore, 200);

  return [
    { label: 'Accuracy', value: accuracyScore, maxValue: 400 },
    { label: 'Evidence Quality', value: evidenceScore, maxValue: 300 },
    { label: 'Volume', value: volumeScore, maxValue: 200 },
  ];
}
