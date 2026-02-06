/**
 * Shared Scoring System - Single Source of Truth
 *
 * This module consolidates ALL scoring logic to match /how-scoring-works exactly.
 * Any scoring displayed anywhere in the app MUST use these functions.
 */

// ============================================================================
// RELIABILITY SCORE SYSTEM (0-1000)
// ============================================================================

export type ReliabilityTier = 'novice' | 'trusted' | 'expert' | 'master' | 'legend';

/**
 * Reliability tier thresholds and display info
 * SOURCE: /how-scoring-works page
 */
export const RELIABILITY_TIERS = {
  legend: {
    min: 800,
    max: 1000,
    label: 'Legend',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  master: {
    min: 650,
    max: 799,
    label: 'Master',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  expert: {
    min: 500,
    max: 649,
    label: 'Expert',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  trusted: {
    min: 300,
    max: 499,
    label: 'Trusted',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  novice: {
    min: 0,
    max: 299,
    label: 'Novice',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
} as const;

/**
 * Reliability Score Formula
 * SOURCE: /how-scoring-works - "Example Calculation" section
 *
 * Formula: (Accuracy × 500) + (Evidence Quality × 300) + (Activity bonus up to 200)
 * - Accuracy: 50% weight (0-500 points)
 * - Evidence Quality: 30% weight (0-300 points)
 * - Activity: 20% weight (0-200 points)
 */
export function calculateReliabilityScore(params: {
  correctPredictions: number;
  incorrectPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number; // 0-100
}): number {
  const { correctPredictions, resolvedPredictions, avgEvidenceScore } = params;

  if (resolvedPredictions === 0) {
    return 0;
  }

  // 1. Accuracy (50% weight = 500 points max)
  const accuracy = correctPredictions / resolvedPredictions;
  const accuracyScore = accuracy * 500;

  // 2. Evidence Quality (30% weight = 300 points max)
  const evidenceScore = (avgEvidenceScore / 100) * 300;

  // 3. Activity (20% weight = 200 points max)
  // Progressive rewards based on volume
  let activityScore = 0;
  if (resolvedPredictions <= 5) {
    activityScore = resolvedPredictions * 40;
  } else if (resolvedPredictions <= 20) {
    activityScore = 200; // 5 * 40 = already at max for this tier
  } else {
    activityScore = 200; // Cap at 200
  }
  activityScore = Math.min(activityScore, 200);

  const totalScore = accuracyScore + evidenceScore + activityScore;

  return Math.min(Math.round(totalScore), 1000);
}

/**
 * Get tier from score
 */
export function getReliabilityTier(score: number): ReliabilityTier {
  if (score >= RELIABILITY_TIERS.legend.min) return 'legend';
  if (score >= RELIABILITY_TIERS.master.min) return 'master';
  if (score >= RELIABILITY_TIERS.expert.min) return 'expert';
  if (score >= RELIABILITY_TIERS.trusted.min) return 'trusted';
  return 'novice';
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: ReliabilityTier) {
  return RELIABILITY_TIERS[tier];
}

// ============================================================================
// EVIDENCE GRADE SYSTEM (0-100)
// ============================================================================

export type EvidenceGrade = 'unverified' | 'basic' | 'solid' | 'strong';

/**
 * Evidence grade thresholds and display info
 * SOURCE: /how-scoring-works page
 */
export const EVIDENCE_GRADES = {
  strong: {
    min: 76,
    max: 100,
    label: 'Strong',
    range: '76-100',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Multiple sources + screenshots',
  },
  solid: {
    min: 51,
    max: 75,
    label: 'Solid',
    range: '51-75',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Good sources or multiple items',
  },
  basic: {
    min: 26,
    max: 50,
    label: 'Basic',
    range: '26-50',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Some evidence but limited',
  },
  unverified: {
    min: 0,
    max: 25,
    label: 'Unverified',
    range: '0-25',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Minimal or no evidence',
  },
} as const;

/**
 * Get evidence grade from score
 */
export function getEvidenceGrade(score: number): EvidenceGrade {
  if (score >= EVIDENCE_GRADES.strong.min) return 'strong';
  if (score >= EVIDENCE_GRADES.solid.min) return 'solid';
  if (score >= EVIDENCE_GRADES.basic.min) return 'basic';
  return 'unverified';
}

/**
 * Get grade display info
 */
export function getEvidenceGradeInfo(grade: EvidenceGrade) {
  return EVIDENCE_GRADES[grade];
}

// ============================================================================
// POINTS SYSTEM (Cumulative, never decreases)
// ============================================================================

/**
 * Points awarded for actions
 * SOURCE: /how-scoring-works - "Total Points System" section
 */
export const POINTS_CONFIG = {
  // Lock prediction: +10
  LOCK_BASE: 10,

  // Resolve correct: +80-150 (base 80 + evidence multiplier + high-risk bonus)
  RESOLVE_CORRECT_BASE: 80,
  RESOLVE_CORRECT_MAX: 150,

  // Resolve incorrect: -30
  RESOLVE_INCORRECT_PENALTY: -30,

  // High-risk category bonus: +40
  HIGH_RISK_BONUS: 40,

  // Streak bonus: +10
  STREAK_BONUS: 10,
} as const;

/**
 * High-risk categories that earn bonus points
 */
export const HIGH_RISK_CATEGORIES = ['Crypto', 'Markets', 'Politics'];

/**
 * Calculate points for locking a prediction
 */
export function calculateLockPoints(): number {
  return POINTS_CONFIG.LOCK_BASE;
}

/**
 * Calculate points for resolving a prediction
 */
export function calculateResolvePoints(params: {
  isCorrect: boolean;
  evidenceScore: number; // 0-100
  category?: string;
  hasStreak?: boolean;
}): number {
  const { isCorrect, evidenceScore, category, hasStreak } = params;

  if (!isCorrect) {
    return POINTS_CONFIG.RESOLVE_INCORRECT_PENALTY;
  }

  // Base points for correct resolution
  let points = POINTS_CONFIG.RESOLVE_CORRECT_BASE;

  // Evidence score affects the final amount (80-110 range from base)
  // Score 0 = 80pts, Score 100 = 110pts
  const evidenceBonus = (evidenceScore / 100) * 30;
  points += evidenceBonus;

  // High-risk category bonus
  if (category && HIGH_RISK_CATEGORIES.includes(category)) {
    points += POINTS_CONFIG.HIGH_RISK_BONUS;
  }

  // Streak bonus
  if (hasStreak) {
    points += POINTS_CONFIG.STREAK_BONUS;
  }

  return Math.min(Math.round(points), POINTS_CONFIG.RESOLVE_CORRECT_MAX);
}

// ============================================================================
// TRUST SCORE (For sorting "Highest trust")
// ============================================================================

/**
 * Calculate trust score for a prediction
 * Combines evidence quality + author reliability + community validation
 * Used for "Highest trust" sort option
 */
export function calculateTrustScore(params: {
  evidenceScore?: number; // 0-100
  authorReliabilityScore?: number; // 0-1000
  verifiedCount?: number;
  disputeCount?: number;
  upvotesCount?: number;
}): number {
  const {
    evidenceScore = 0,
    authorReliabilityScore = 0,
    verifiedCount = 0,
    disputeCount = 0,
    upvotesCount = 0,
  } = params;

  // Evidence quality (40% weight)
  const evidenceComponent = (evidenceScore / 100) * 400;

  // Author reliability (30% weight)
  const authorComponent = (authorReliabilityScore / 1000) * 300;

  // Community validation (30% weight)
  const verificationRatio =
    verifiedCount + disputeCount > 0
      ? verifiedCount / (verifiedCount + disputeCount)
      : 0.5; // Neutral if no verification yet
  const communityComponent = verificationRatio * 200 + Math.min(upvotesCount * 2, 100);

  return Math.round(evidenceComponent + authorComponent + communityComponent);
}

// ============================================================================
// FILTERING HELPERS
// ============================================================================

/**
 * Check if reliability score qualifies as "high trust"
 * Used for "High evidence" filter
 */
export function isHighTrust(reliabilityScore: number): boolean {
  return reliabilityScore >= RELIABILITY_TIERS.trusted.min;
}

/**
 * Check if evidence score qualifies as "high evidence"
 * Used for "High evidence" filter
 */
export function isHighEvidence(evidenceScore: number): boolean {
  return evidenceScore >= EVIDENCE_GRADES.strong.min;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Format score breakdown for transparency
 */
export function getScoreBreakdown(params: {
  correctPredictions: number;
  resolvedPredictions: number;
  avgEvidenceScore: number;
}): Array<{ label: string; value: number; maxValue: number; percentage: string }> {
  const { correctPredictions, resolvedPredictions, avgEvidenceScore } = params;

  if (resolvedPredictions === 0) {
    return [];
  }

  const accuracy = correctPredictions / resolvedPredictions;
  const accuracyScore = Math.round(accuracy * 500);
  const evidenceScore = Math.round((avgEvidenceScore / 100) * 300);

  let activityScore = 0;
  if (resolvedPredictions <= 5) {
    activityScore = resolvedPredictions * 40;
  } else {
    activityScore = 200;
  }
  activityScore = Math.min(activityScore, 200);

  return [
    {
      label: 'Accuracy',
      value: accuracyScore,
      maxValue: 500,
      percentage: '50%',
    },
    {
      label: 'Evidence Quality',
      value: evidenceScore,
      maxValue: 300,
      percentage: '30%',
    },
    {
      label: 'Activity',
      value: activityScore,
      maxValue: 200,
      percentage: '20%',
    },
  ];
}
