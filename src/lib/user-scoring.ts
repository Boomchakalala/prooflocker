/**
 * User Scoring System
 *
 * Two parallel systems:
 * 1. XP (uncapped, never decreases) - for progression and milestones
 * 2. Reputation Score (0-1000, changes with performance) - for trust and voting rights
 */

import {
  getReputationTier,
  REPUTATION_TIERS,
  type ReputationTier,
  calculateReputationChange,
  calculateLockXP,
  calculateResolveXP,
  applyReputationChange,
  REPUTATION_STARTING,
  REPUTATION_OVERDUE_PENALTY,
  REPUTATION_AUTO_ARCHIVE_PENALTY,
  REPUTATION_OVERRULED_PENALTY,
  type EvidenceGrade,
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
 * Points awarded for actions (XP System)
 */
export const XP_CONFIG = {
  // Lock claim
  LOCK_BASE: 10,

  // Initial evidence bonuses
  LOCK_EVIDENCE_A: 20,
  LOCK_EVIDENCE_B: 15,
  LOCK_EVIDENCE_C: 10,
  LOCK_EVIDENCE_D: 0,

  // Resolve claim
  RESOLVE_BASE: 50,
  RESOLVE_CORRECT_BONUS: 100,
  RESOLVE_ONTIME_BONUS: 20,
};

/**
 * Get tier info for display
 */
export function getTierInfo(tier: ReputationTier) {
  return REPUTATION_TIERS.find((t) => t.name === tier) || REPUTATION_TIERS[0];
}

/**
 * Calculate XP for locking a claim
 */
export function calculateLockPoints(evidenceGrade?: EvidenceGrade): number {
  return calculateLockXP(evidenceGrade);
}

/**
 * Calculate points and reputation for resolving a claim
 */
export function calculateResolvePoints(
  isCorrect: boolean,
  evidenceGrade: EvidenceGrade,
  onTime: boolean
): {
  xpEarned: number;
  reputationChange: number;
} {
  const xpEarned = calculateResolveXP(isCorrect, onTime);
  const reputationChange = calculateReputationChange(isCorrect, evidenceGrade);

  return {
    xpEarned,
    reputationChange,
  };
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
    reputationChange: REPUTATION_OVERRULED_PENALTY,
  };
}

/**
 * Calculate overdue penalty
 */
export function calculateOverduePenalty(): {
  xpEarned: number;
  reputationChange: number;
} {
  return {
    xpEarned: 0,
    reputationChange: REPUTATION_OVERDUE_PENALTY,
  };
}

/**
 * Calculate auto-archive penalty
 */
export function calculateAutoArchivePenalty(): {
  xpEarned: number;
  reputationChange: number;
} {
  return {
    xpEarned: 0,
    reputationChange: REPUTATION_AUTO_ARCHIVE_PENALTY,
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
  const tierInfo = getTierInfo(tier.name);

  return {
    score: Math.round(reputation),
    tier: tier.name,
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

// @deprecated Use calculateReputationChange instead
export function calculateReliabilityScore(stats: {
  correctPredictions: number;
  incorrectPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number;
}): number {
  // Simplified calculation for backward compatibility
  // In new system, reputation is tracked directly, not calculated from stats
  const { correctPredictions, resolvedPredictions, avgEvidenceScore } = stats;

  if (resolvedPredictions === 0) {
    return REPUTATION_STARTING;
  }

  const winRate = correctPredictions / resolvedPredictions;
  const accuracyScore = winRate * 400;
  const evidenceScore = (avgEvidenceScore / 100) * 300;

  let volumeScore = 0;
  if (resolvedPredictions <= 5) {
    volumeScore = resolvedPredictions * 40;
  } else if (resolvedPredictions <= 20) {
    volumeScore = 200 + (resolvedPredictions - 5) * 5;
  } else {
    volumeScore = 275 + Math.min((resolvedPredictions - 20) * 2, 125);
  }
  volumeScore = Math.min(volumeScore, 200);

  const hasGoodEvidence = avgEvidenceScore >= 50;
  const hasGoodAccuracy = winRate >= 0.6;
  let consistencyBonus = 0;
  if (hasGoodEvidence && hasGoodAccuracy && resolvedPredictions >= 5) {
    consistencyBonus = Math.min(resolvedPredictions * 5, 100);
  }

  const totalScore = accuracyScore + evidenceScore + volumeScore + consistencyBonus;
  return Math.min(Math.round(totalScore), 1000);
}
