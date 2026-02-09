// ProofLocker Reputation & XP Scoring System
// Based on specification from how-scoring-works page

export interface ReputationTier {
  name: 'Novice' | 'Trusted' | 'Expert' | 'Master' | 'Legend';
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

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

export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

export interface EvidenceGradeInfo {
  grade: EvidenceGrade;
  label: string;
  reputationCorrect: number;
  reputationIncorrect: number;
  xpBonus: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const EVIDENCE_GRADES: Record<EvidenceGrade, EvidenceGradeInfo> = {
  A: {
    grade: 'A',
    label: 'Authoritative',
    reputationCorrect: 40,
    reputationIncorrect: -30,
    xpBonus: 20,
    color: 'green',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  B: {
    grade: 'B',
    label: 'High-Quality',
    reputationCorrect: 32,
    reputationIncorrect: -35,
    xpBonus: 15,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  C: {
    grade: 'C',
    label: 'Weak/Indirect',
    reputationCorrect: 25,
    reputationIncorrect: -38,
    xpBonus: 10,
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
  },
  D: {
    grade: 'D',
    label: 'No Evidence',
    reputationCorrect: 15,
    reputationIncorrect: -42,
    xpBonus: 0,
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
  },
};

// Reputation Score Constants
export const REPUTATION_STARTING = 100;
export const REPUTATION_MIN = 0;
export const REPUTATION_MAX = 1000;
export const REPUTATION_OVERDUE_PENALTY = -10;
export const REPUTATION_OVERDUE_MAX_PER_MONTH = -50;
export const REPUTATION_AUTO_ARCHIVE_PENALTY = -20;
export const REPUTATION_OVERRULED_PENALTY = -20;

// XP Constants
export const XP_LOCK_CLAIM = 10;
export const XP_RESOLVE_BASE = 50;
export const XP_CORRECT_BONUS = 100;
export const XP_ONTIME_BONUS = 20;

// Get reputation tier based on score
export function getReputationTier(reputation: number): ReputationTier {
  for (const tier of REPUTATION_TIERS) {
    if (reputation >= tier.min && reputation <= tier.max) {
      return tier;
    }
  }
  return REPUTATION_TIERS[0]; // Default to Novice
}

// Get evidence grade info
export function getEvidenceGradeInfo(grade: EvidenceGrade): EvidenceGradeInfo {
  return EVIDENCE_GRADES[grade];
}

// Convert numeric evidence score (0-100) to letter grade (A-D)
export function convertEvidenceScoreToGrade(score: number): EvidenceGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

// Calculate reputation change for resolution
export function calculateReputationChange(
  isCorrect: boolean,
  evidenceGrade: EvidenceGrade
): number {
  const gradeInfo = EVIDENCE_GRADES[evidenceGrade];
  return isCorrect ? gradeInfo.reputationCorrect : gradeInfo.reputationIncorrect;
}

// Calculate XP for locking a claim
export function calculateLockXP(evidenceGrade?: EvidenceGrade): number {
  let xp = XP_LOCK_CLAIM;
  if (evidenceGrade) {
    xp += EVIDENCE_GRADES[evidenceGrade].xpBonus;
  }
  return xp;
}

// Calculate XP for resolving a claim
export function calculateResolveXP(isCorrect: boolean, onTime: boolean): number {
  let xp = XP_RESOLVE_BASE;
  if (isCorrect) {
    xp += XP_CORRECT_BONUS;
  }
  if (onTime) {
    xp += XP_ONTIME_BONUS;
  }
  return xp;
}

// Apply reputation change with bounds (0-1000)
export function applyReputationChange(
  currentReputation: number,
  change: number
): number {
  const newReputation = currentReputation + change;
  return Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, newReputation));
}

// Calculate total XP for a full claim lifecycle
export function calculateTotalClaimXP(
  hasInitialEvidence: boolean,
  initialEvidenceGrade: EvidenceGrade | undefined,
  resolved: boolean,
  isCorrect: boolean,
  onTime: boolean
): number {
  let totalXP = XP_LOCK_CLAIM;

  // Initial evidence bonus
  if (hasInitialEvidence && initialEvidenceGrade) {
    totalXP += EVIDENCE_GRADES[initialEvidenceGrade].xpBonus;
  }

  // Resolution XP
  if (resolved) {
    totalXP += calculateResolveXP(isCorrect, onTime);
  }

  return totalXP;
}

// Format reputation score for display
export function formatReputation(reputation: number): string {
  return reputation.toFixed(0);
}

// Format XP for display
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toFixed(0);
}

// Get XP milestone info
export interface XPMilestone {
  xp: number;
  label: string;
  reached: boolean;
}

export function getXPMilestones(currentXP: number): XPMilestone[] {
  const milestones = [
    { xp: 1000, label: 'Special profile badge' },
    { xp: 5000, label: 'Priority claim visibility' },
    { xp: 10000, label: 'Custom profile theme' },
    { xp: 25000, label: 'Veteran Predictor title' },
    { xp: 50000, label: 'Leaderboard recognition' },
  ];

  return milestones.map((m) => ({
    ...m,
    reached: currentXP >= m.xp,
  }));
}

// Get next XP milestone
export function getNextXPMilestone(currentXP: number): XPMilestone | null {
  const milestones = getXPMilestones(currentXP);
  const next = milestones.find((m) => !m.reached);
  return next || null;
}
