/**
 * User Scoring System
 *
 * Two parallel systems:
 * 1. XP (uncapped, never decreases) - for progression and milestones
 * 2. Reputation Score (0-1000, weighted calculation) - for trust and voting rights
 */

import {
  getReputationTier,
  REPUTATION_TIERS,
  type ReputationTier,
  calculateWeightedReputation,
  calculateLockXP,
  calculateResolveXP,
  applyReputationChange,
  REPUTATION_STARTING,
  OVERDUE_ACTIVITY_PENALTY,
  OVERDUE_MAX_PENALTY_PER_MONTH,
  AUTO_ARCHIVE_ACTIVITY_PENALTY,
  OVERRULED_PENALTY,
  type EvidenceGrade,
  evidenceGradeToPoints,
  convertEvidenceScoreToGrade,
} from './reputation-scoring';

export interface UserStats {
  // XP (cumulative, never decreases)
  totalXP: number;

  // Reputation Score components
  totalPredictions: number;
  resolvedPredictions: number;
  correctPredictions: number;
  incorrectPredictions: number;
  avgEvidenceScore: number;

  // Calculated
  winRate: number;
  reputationScore: number;
  tier: ReputationTier;
}

// Re-export reputation types
export type { ReputationTier, EvidenceGrade };
export { REPUTATION_TIERS, getReputationTier };

/**
 * Calculate reputation score using weighted formula
 */
export function calculateReputationScore(stats: {
  correctPredictions: number;
  totalResolved: number;
  averageEvidenceScore: number; // Average evidence points (A=100, B=75, C=50, D=25)
  overdueCount?: number;
  autoArchiveCount?: number;
}): number {
  const result = calculateWeightedReputation({
    correctResolutions: stats.correctPredictions,
    totalResolved: stats.totalResolved,
    averageEvidenceScore: stats.averageEvidenceScore,
    overdueCount: stats.overdueCount,
    autoArchiveCount: stats.autoArchiveCount,
  });

  return result.total;
}

/**
 * Get tier info for display
 */
export function getTierInfo(tier: ReputationTier) {
  return REPUTATION_TIERS.find((t) => t.name === tier.name) || REPUTATION_TIERS[0];
}

/**
 * Calculate XP for locking a claim
 */
export function calculateLockPoints(evidenceGrade?: EvidenceGrade): number {
  return calculateLockXP(evidenceGrade);
}

/**
 * Calculate XP for resolving a claim
 */
export function calculateResolvePoints(
  isCorrect: boolean,
  onTime: boolean,
  isHighRisk: boolean = false,
  consecutiveCorrectStreak: number = 0
): {
  xpEarned: number;
} {
  const xpEarned = calculateResolveXP({
    isCorrect,
    onTime,
    isHighRisk,
    consecutiveCorrectStreak,
  });

  return { xpEarned };
}

/**
 * Calculate penalty for overruled resolution
 */
export function calculateOverruledPenalty(): {
  xpEarned: number;
  reputationChange: number;
} {
  return {
    xpEarned: 0,
    reputationChange: OVERRULED_PENALTY,
  };
}

/**
 * Calculate overdue penalty (applied to activity component)
 */
export function calculateOverduePenalty(): {
  xpEarned: number;
  activityPenalty: number;
} {
  return {
    xpEarned: 0,
    activityPenalty: OVERDUE_ACTIVITY_PENALTY,
  };
}

/**
 * Calculate auto-archive penalty (applied to activity component)
 */
export function calculateAutoArchivePenalty(): {
  xpEarned: number;
  activityPenalty: number;
} {
  return {
    xpEarned: 0,
    activityPenalty: AUTO_ARCHIVE_ACTIVITY_PENALTY,
  };
}

/**
 * Apply reputation change to current score
 */
export function applyReputationUpdate(
  currentReputation: number,
  change: number
): number {
  return applyReputationChange(currentReputation, change);
}

/**
 * Get next tier milestone
 */
export function getNextTierMilestone(currentScore: number): {
  nextTier: ReputationTier | null;
  pointsNeeded: number;
  tierInfo: typeof REPUTATION_TIERS[number] | null;
} {
  for (const tier of REPUTATION_TIERS) {
    if (currentScore < tier.min) {
      return {
        nextTier: tier,
        pointsNeeded: tier.min - currentScore,
        tierInfo: tier,
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
 * Format points/XP with commas or k suffix
 */
export function formatPoints(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toLocaleString();
}

/**
 * Get reputation display text
 */
export function getReputationDisplay(reputation: number): {
  score: number;
  tier: ReputationTier;
  tierInfo: typeof REPUTATION_TIERS[number];
} {
  const tier = getReputationTier(reputation);
  const tierInfo = getTierInfo(tier);

  return {
    score: Math.round(reputation),
    tier: tier,
    tierInfo,
  };
}

// LEGACY COMPATIBILITY - Deprecated, use reputation functions instead
export type ReliabilityTier = 'Novice' | 'Trusted' | 'Expert' | 'Master' | 'Legend';

export const RELIABILITY_TIERS = {
  Legend: { min: 800, label: 'Legend', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  Master: { min: 650, label: 'Master', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  Expert: { min: 500, label: 'Expert', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  Trusted: { min: 300, label: 'Trusted', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  Novice: { min: 0, label: 'Novice', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
};

// @deprecated Use getReputationTier instead
export function getReliabilityTier(score: number): ReliabilityTier {
  if (score >= 800) return 'Legend';
  if (score >= 650) return 'Master';
  if (score >= 500) return 'Expert';
  if (score >= 300) return 'Trusted';
  return 'Novice';
}

// @deprecated Use calculateReputationScore with weighted formula instead
export function calculateReliabilityScore(stats: {
  correctPredictions: number;
  incorrectPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number;
}): number {
  // Use weighted calculation for backward compatibility
  return calculateReputationScore({
    correctPredictions: stats.correctPredictions,
    totalResolved: stats.resolvedPredictions,
    averageEvidenceScore: stats.avgEvidenceScore,
  });
}

// @deprecated - For backward compatibility only
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

  const result = calculateWeightedReputation({
    correctResolutions: correctPredictions,
    totalResolved: resolvedPredictions,
    averageEvidenceScore: avgEvidenceScore,
  });

  return [
    { label: 'Accuracy', value: result.accuracy, maxValue: 500 },
    { label: 'Evidence Quality', value: result.evidenceQuality, maxValue: 300 },
    { label: 'Activity', value: result.activity, maxValue: 200 },
  ];
}
