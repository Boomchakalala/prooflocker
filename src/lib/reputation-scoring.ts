/**
 * Weighted Reputation Scoring System
 *
 * Reputation Score (0-1000, starts at 100):
 * - Accuracy (50%, max 500): (Correct / Total resolved) × 500
 * - Evidence Quality (30%, max 300): Average evidence score × 3
 * - Activity (20%, max 200): 10 points per resolved claim, capped at 20
 *
 * XP (uncapped, never decreases):
 * - Lock: +10 + evidence bonus (A+20, B+15, C+10, D+0)
 * - Resolve: +50 base, +100 correct, +20 on-time, +40 high-risk, +10 per streak
 */

export type ReputationTierName = 'Novice' | 'Trusted' | 'Expert' | 'Master' | 'Legend';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

export interface ReputationTier {
  name: ReputationTierName;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface EvidenceGradeInfo {
  grade: EvidenceGrade;
  label: string;
  points: number; // Points for reputation calculation
  xpBonus: number; // XP bonus when locking with this evidence
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// Reputation Constants
export const REPUTATION_STARTING = 100;
export const REPUTATION_MIN = 0;
export const REPUTATION_MAX = 1000;

// Reputation Weights
export const ACCURACY_WEIGHT = 0.5;
export const ACCURACY_MAX = 500;
export const EVIDENCE_WEIGHT = 0.3;
export const EVIDENCE_MAX = 300;
export const ACTIVITY_WEIGHT = 0.2;
export const ACTIVITY_MAX = 200;
export const ACTIVITY_POINTS_PER_RESOLUTION = 10;
export const ACTIVITY_MAX_RESOLUTIONS = 20;

// Reputation Penalties
export const OVERRULED_PENALTY = -25; // Direct subtraction
export const OVERDUE_ACTIVITY_PENALTY = -5; // Per overdue claim
export const OVERDUE_MAX_PENALTY_PER_MONTH = -25;
export const AUTO_ARCHIVE_ACTIVITY_PENALTY = -10;

// XP Constants
export const XP_LOCK_BASE = 10;
export const XP_RESOLVE_BASE = 50;
export const XP_CORRECT_BONUS = 100;
export const XP_ONTIME_BONUS = 20;
export const XP_HIGH_RISK_BONUS = 40;
export const XP_STREAK_BONUS = 10;

// Reputation Tiers
export const REPUTATION_TIERS: ReputationTier[] = [
  {
    name: 'Novice',
    min: 0,
    max: 299,
    color: 'gray',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
  },
  {
    name: 'Trusted',
    min: 300,
    max: 499,
    color: 'green',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  {
    name: 'Expert',
    min: 500,
    max: 649,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  {
    name: 'Master',
    min: 650,
    max: 799,
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  {
    name: 'Legend',
    min: 800,
    max: 1000,
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
  },
];

// Evidence Grades
export const EVIDENCE_GRADES: Record<EvidenceGrade, EvidenceGradeInfo> = {
  A: {
    grade: 'A',
    label: 'Authoritative',
    points: 100,
    xpBonus: 20,
    color: 'green',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  B: {
    grade: 'B',
    label: 'Reputable',
    points: 75,
    xpBonus: 15,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  C: {
    grade: 'C',
    label: 'Reasonable',
    points: 50,
    xpBonus: 10,
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
  },
  D: {
    grade: 'D',
    label: 'Weak/Minimal',
    points: 25,
    xpBonus: 0,
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
  },
};

/**
 * Calculate weighted reputation score
 */
export function calculateWeightedReputation(stats: {
  correctResolutions: number;
  totalResolved: number;
  averageEvidenceScore: number; // Average of evidence points (A=100, B=75, C=50, D=25)
  overdueCount?: number;
  autoArchiveCount?: number;
}): {
  total: number;
  accuracy: number;
  evidenceQuality: number;
  activity: number;
} {
  const { correctResolutions, totalResolved, averageEvidenceScore, overdueCount = 0, autoArchiveCount = 0 } = stats;

  // Accuracy (50%, max 500)
  const accuracyScore = totalResolved > 0
    ? (correctResolutions / totalResolved) * ACCURACY_MAX
    : 0;

  // Evidence Quality (30%, max 300)
  const evidenceScore = averageEvidenceScore * 3;

  // Activity (20%, max 200)
  const baseActivity = Math.min(totalResolved * ACTIVITY_POINTS_PER_RESOLUTION, ACTIVITY_MAX);
  const overduePenalty = Math.min(overdueCount * Math.abs(OVERDUE_ACTIVITY_PENALTY), Math.abs(OVERDUE_MAX_PENALTY_PER_MONTH));
  const archivePenalty = autoArchiveCount * Math.abs(AUTO_ARCHIVE_ACTIVITY_PENALTY);
  const activityScore = Math.max(0, baseActivity - overduePenalty - archivePenalty);

  // Total (capped at 0-1000)
  const total = Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, Math.round(accuracyScore + evidenceScore + activityScore)));

  return {
    total,
    accuracy: Math.round(accuracyScore),
    evidenceQuality: Math.round(evidenceScore),
    activity: Math.round(activityScore),
  };
}

/**
 * Get reputation tier from score
 */
export function getReputationTier(score: number): ReputationTier {
  for (const tier of [...REPUTATION_TIERS].reverse()) {
    if (score >= tier.min) {
      return tier;
    }
  }
  return REPUTATION_TIERS[0]; // Novice
}

/**
 * Get evidence grade info
 */
export function getEvidenceGradeInfo(grade: EvidenceGrade): EvidenceGradeInfo {
  return EVIDENCE_GRADES[grade];
}

/**
 * Convert numeric evidence score (0-100) to letter grade (A-D)
 */
export function convertEvidenceScoreToGrade(score: number): EvidenceGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

/**
 * Calculate XP for locking a claim
 */
export function calculateLockXP(evidenceGrade?: EvidenceGrade): number {
  let xp = XP_LOCK_BASE;

  if (evidenceGrade) {
    const gradeInfo = getEvidenceGradeInfo(evidenceGrade);
    xp += gradeInfo.xpBonus;
  }

  return xp;
}

/**
 * Calculate XP for resolving a claim
 */
export function calculateResolveXP(params: {
  isCorrect: boolean;
  onTime: boolean;
  isHighRisk?: boolean;
  consecutiveCorrectStreak?: number;
}): number {
  const { isCorrect, onTime, isHighRisk = false, consecutiveCorrectStreak = 0 } = params;

  let xp = XP_RESOLVE_BASE;

  if (isCorrect) {
    xp += XP_CORRECT_BONUS;
  }

  if (onTime) {
    xp += XP_ONTIME_BONUS;
  }

  if (isHighRisk) {
    xp += XP_HIGH_RISK_BONUS;
  }

  if (consecutiveCorrectStreak > 0) {
    xp += consecutiveCorrectStreak * XP_STREAK_BONUS;
  }

  return xp;
}

/**
 * Apply reputation change with bounds
 */
export function applyReputationChange(current: number, change: number): number {
  const newScore = current + change;
  return Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, Math.round(newScore)));
}

/**
 * Format reputation score for display
 */
export function formatReputation(score: number): string {
  return Math.round(score).toLocaleString();
}

/**
 * Format XP for display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toFixed(0);
}

/**
 * Get XP milestones with progress
 */
export interface XPMilestone {
  xp: number;
  label: string;
  unlocked: boolean;
  progress?: number;
}

export function getXPMilestones(currentXP: number): XPMilestone[] {
  const milestones = [
    { xp: 1000, label: 'Milestone badge' },
    { xp: 5000, label: 'Priority claim visibility' },
    { xp: 10000, label: 'Custom theme & early contest access' },
    { xp: 25000, label: 'Veteran status' },
    { xp: 50000, label: 'Top leaderboard & exclusive rewards' },
  ];

  return milestones.map((milestone, index) => {
    const unlocked = currentXP >= milestone.xp;
    const progress = unlocked
      ? 100
      : index === 0
        ? (currentXP / milestone.xp) * 100
        : milestones[index - 1] && currentXP >= milestones[index - 1].xp
          ? ((currentXP - milestones[index - 1].xp) / (milestone.xp - milestones[index - 1].xp)) * 100
          : 0;

    return {
      ...milestone,
      unlocked,
      progress: Math.round(progress),
    };
  });
}

/**
 * Calculate evidence score from grade (for reputation calculation)
 */
export function evidenceGradeToPoints(grade: EvidenceGrade | null): number {
  if (!grade) return 0;
  return EVIDENCE_GRADES[grade]?.points || 0;
}

/**
 * Calculate total XP for a full claim lifecycle
 */
export function calculateTotalClaimXP(
  hasInitialEvidence: boolean,
  initialEvidenceGrade: EvidenceGrade | undefined,
  resolved: boolean,
  isCorrect: boolean,
  onTime: boolean,
  isHighRisk: boolean = false,
  consecutiveCorrectStreak: number = 0
): number {
  let totalXP = XP_LOCK_BASE;

  // Initial evidence bonus
  if (hasInitialEvidence && initialEvidenceGrade) {
    totalXP += EVIDENCE_GRADES[initialEvidenceGrade].xpBonus;
  }

  // Resolution XP
  if (resolved) {
    totalXP += calculateResolveXP({ isCorrect, onTime, isHighRisk, consecutiveCorrectStreak });
  }

  return totalXP;
}
