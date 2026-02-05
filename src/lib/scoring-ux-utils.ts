/**
 * UX Simplification Utilities
 * Helper functions for converting complex scores to simple, user-friendly labels
 */

// ============================================================================
// TIER SYSTEM
// ============================================================================

export type SimplifiedTier = 'novice' | 'trusted' | 'expert' | 'master' | 'legend';

export interface TierConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  gradient: string;
  minScore: number;
  maxScore: number;
}

export const SIMPLIFIED_TIERS: Record<SimplifiedTier, TierConfig> = {
  legend: {
    icon: '⭐',
    label: 'Legend',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    gradient: 'from-yellow-400 to-orange-500',
    minScore: 800,
    maxScore: 1000,
  },
  master: {
    icon: '👑',
    label: 'Master',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    gradient: 'from-purple-400 to-purple-600',
    minScore: 650,
    maxScore: 799,
  },
  expert: {
    icon: '💎',
    label: 'Expert',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    gradient: 'from-blue-400 to-blue-600',
    minScore: 500,
    maxScore: 649,
  },
  trusted: {
    icon: '✓',
    label: 'Trusted',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    gradient: 'from-green-400 to-green-600',
    minScore: 300,
    maxScore: 499,
  },
  novice: {
    icon: '•',
    label: 'Novice',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    gradient: 'from-gray-400 to-gray-600',
    minScore: 0,
    maxScore: 299,
  },
};

/**
 * Get simplified tier from reliability score
 */
export function getTierFromScore(reliabilityScore: number): SimplifiedTier {
  if (reliabilityScore >= 800) return 'legend';
  if (reliabilityScore >= 650) return 'master';
  if (reliabilityScore >= 500) return 'expert';
  if (reliabilityScore >= 300) return 'trusted';
  return 'novice';
}

/**
 * Get tier config
 */
export function getTierConfig(tier: SimplifiedTier): TierConfig {
  return SIMPLIFIED_TIERS[tier];
}

/**
 * Get next tier milestone info
 */
export function getNextTierInfo(currentScore: number): {
  nextTier: SimplifiedTier | null;
  nextTierConfig: TierConfig | null;
  pointsNeeded: number;
  progressPercent: number;
} {
  const currentTier = getTierFromScore(currentScore);
  const tiers: SimplifiedTier[] = ['novice', 'trusted', 'expert', 'master', 'legend'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === tiers.length - 1) {
    // Already at max tier
    return {
      nextTier: null,
      nextTierConfig: null,
      pointsNeeded: 0,
      progressPercent: 100,
    };
  }

  const nextTier = tiers[currentIndex + 1];
  const nextTierConfig = SIMPLIFIED_TIERS[nextTier];
  const currentTierConfig = SIMPLIFIED_TIERS[currentTier];

  const pointsNeeded = nextTierConfig.minScore - currentScore;
  const tierRange = nextTierConfig.minScore - currentTierConfig.minScore;
  const progressInTier = currentScore - currentTierConfig.minScore;
  const progressPercent = (progressInTier / tierRange) * 100;

  return {
    nextTier,
    nextTierConfig,
    pointsNeeded,
    progressPercent: Math.min(progressPercent, 100),
  };
}

// ============================================================================
// EVIDENCE QUALITY LABELS
// ============================================================================

export type EvidenceQuality = 'unverified' | 'basic' | 'solid' | 'strong';

export interface EvidenceQualityConfig {
  icon: string;
  label: string;
  color: string;
  description: string;
}

export const EVIDENCE_QUALITY: Record<EvidenceQuality, EvidenceQualityConfig> = {
  strong: {
    icon: '🔍',
    label: 'Strong Evidence',
    color: 'text-green-400',
    description: 'Multiple high-quality sources with documentation',
  },
  solid: {
    icon: '📋',
    label: 'Solid Evidence',
    color: 'text-blue-400',
    description: 'Good supporting evidence from reputable sources',
  },
  basic: {
    icon: '📝',
    label: 'Basic Evidence',
    color: 'text-yellow-400',
    description: 'Some supporting evidence but limited',
  },
  unverified: {
    icon: '❓',
    label: 'Unverified',
    color: 'text-orange-400',
    description: 'Minimal or no supporting evidence',
  },
};

/**
 * Convert evidence score (0-100) to quality label
 */
export function getEvidenceQuality(evidenceScore: number): EvidenceQuality {
  if (evidenceScore >= 76) return 'strong';
  if (evidenceScore >= 51) return 'solid';
  if (evidenceScore >= 26) return 'basic';
  return 'unverified';
}

/**
 * Get evidence quality config
 */
export function getEvidenceQualityConfig(quality: EvidenceQuality): EvidenceQualityConfig {
  return EVIDENCE_QUALITY[quality];
}

// ============================================================================
// NATURAL LANGUAGE FORMATTERS
// ============================================================================

/**
 * Format track record in natural language
 */
export function formatTrackRecord(correct: number, total: number): string {
  if (total === 0) return 'No predictions resolved yet';

  const accuracy = Math.round((correct / total) * 100);

  if (total === 1) {
    return correct === 1 ? '1 prediction correct' : '1 prediction incorrect';
  }

  return `${correct} of ${total} correct (${accuracy}%)`;
}

/**
 * Format activity description
 */
export function formatActivity(
  locksCount: number,
  resolvedCount: number,
  correctCount: number
): string {
  if (locksCount === 0) return 'New forecaster';

  const parts: string[] = [];

  // Locks
  if (locksCount >= 50) parts.push('Prolific predictor');
  else if (locksCount >= 25) parts.push('Active forecaster');
  else if (locksCount >= 10) parts.push('Regular predictor');

  // Accuracy
  if (resolvedCount >= 5) {
    const accuracy = correctCount / resolvedCount;
    if (accuracy >= 0.9) parts.push('Near-perfect accuracy');
    else if (accuracy >= 0.75) parts.push('High accuracy');
    else if (accuracy >= 0.6) parts.push('Solid track record');
  }

  return parts.join(' · ') || 'Getting started';
}

/**
 * Format category expertise
 */
export function formatCategoryExpertise(categoryStats: Record<string, { correct: number; total: number }>): string {
  const entries = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.total >= 5 && stats.correct / stats.total >= 0.7)
    .sort((a, b) => b[1].correct - a[1].correct);

  if (entries.length === 0) return null;

  const [category, stats] = entries[0];
  const accuracy = Math.round((stats.correct / stats.total) * 100);

  const categoryNames: Record<string, string> = {
    Crypto: 'Crypto',
    Politics: 'Politics',
    Markets: 'Markets',
    Tech: 'Tech',
    Sports: 'Sports',
    Personal: 'Goals',
    Business: 'Business',
  };

  return `${categoryNames[category] || category} expert (${stats.correct}/${stats.total})`;
}

/**
 * Format streak bonus
 */
export function formatStreak(currentStreak: number): string | null {
  if (currentStreak < 3) return null;
  if (currentStreak >= 10) return `🔥 ${currentStreak}-streak (Unstoppable!)`;
  if (currentStreak >= 5) return `🔥 ${currentStreak}-streak`;
  if (currentStreak >= 3) return `🔥 Hot streak`;
  return null;
}

/**
 * Format leaderboard position
 */
export function formatLeaderboardPosition(rank: number, totalUsers: number): string {
  if (rank === 1) return '🏆 #1 Forecaster';
  if (rank <= 3) return `🥇 Top 3`;
  if (rank <= 10) return `🏅 Top 10`;
  if (rank <= 50) return `⭐ Top 50`;
  if (rank <= 100) return `📈 Top 100`;

  const percentile = Math.round((rank / totalUsers) * 100);
  return `Top ${percentile}%`;
}

/**
 * Format trend arrow
 */
export function formatTrendArrow(previousScore: number, currentScore: number): string {
  const diff = currentScore - previousScore;
  if (diff > 10) return '↗';
  if (diff < -10) return '↘';
  return '─';
}

// ============================================================================
// STATS SUMMARY
// ============================================================================

export interface SimplifiedStats {
  // Primary
  tierIcon: string;
  tierLabel: string;
  tierColor: string;
  reliabilityScore: number;

  // Secondary
  totalPoints: number;
  trackRecord: string; // "12 of 15 correct"

  // Tertiary
  activity: string; // "Active forecaster · High accuracy"
  categoryExpertise: string | null; // "Crypto expert (8/10)"
  streak: string | null; // "🔥 5-streak"

  // Progress
  nextTier: {
    icon: string;
    label: string;
    pointsNeeded: number;
    progressPercent: number;
  } | null;
}

/**
 * Get simplified stats summary for display
 */
export function getSimplifiedStats(stats: {
  reliabilityScore: number;
  totalPoints: number;
  correctResolves: number;
  totalResolves: number;
  locksCount: number;
  currentStreak: number;
  categoryStats: Record<string, { correct: number; total: number }>;
}): SimplifiedStats {
  const tier = getTierFromScore(stats.reliabilityScore);
  const tierConfig = getTierConfig(tier);
  const nextTierInfo = getNextTierInfo(stats.reliabilityScore);

  return {
    // Primary
    tierIcon: tierConfig.icon,
    tierLabel: tierConfig.label,
    tierColor: tierConfig.color,
    reliabilityScore: stats.reliabilityScore,

    // Secondary
    totalPoints: stats.totalPoints,
    trackRecord: formatTrackRecord(stats.correctResolves, stats.totalResolves),

    // Tertiary
    activity: formatActivity(stats.locksCount, stats.totalResolves, stats.correctResolves),
    categoryExpertise: formatCategoryExpertise(stats.categoryStats),
    streak: formatStreak(stats.currentStreak),

    // Progress
    nextTier: nextTierInfo.nextTier ? {
      icon: nextTierInfo.nextTierConfig!.icon,
      label: nextTierInfo.nextTierConfig!.label,
      pointsNeeded: nextTierInfo.pointsNeeded,
      progressPercent: nextTierInfo.progressPercent,
    } : null,
  };
}

// ============================================================================
// COMPACT DISPLAY FORMATTERS
// ============================================================================

/**
 * Format for prediction card author line
 * Example: "💎 @anon-7291 · Expert · 2mo ago"
 */
export function formatAuthorLine(
  anonId: string,
  reliabilityScore: number,
  createdAt: Date
): string {
  const tier = getTierFromScore(reliabilityScore);
  const tierConfig = getTierConfig(tier);
  const timeAgo = formatTimeAgo(createdAt);

  return `${tierConfig.icon} @${anonId.slice(-4)} · ${tierConfig.label} · ${timeAgo}`;
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${diffMonths}mo ago`;
}

/**
 * Format compact stats for leaderboard entry
 * Example: "Master · 23/27 correct · 5-streak 🔥"
 */
export function formatLeaderboardStats(
  reliabilityScore: number,
  correctResolves: number,
  totalResolves: number,
  currentStreak: number,
  categoryStats: Record<string, { correct: number; total: number }>
): string {
  const tier = getTierFromScore(reliabilityScore);
  const tierConfig = getTierConfig(tier);
  const parts: string[] = [tierConfig.label];

  if (totalResolves > 0) {
    parts.push(`${correctResolves}/${totalResolves} correct`);
  }

  const streak = formatStreak(currentStreak);
  if (streak) {
    parts.push(streak);
  }

  const expertise = formatCategoryExpertise(categoryStats);
  if (expertise) {
    parts.push(expertise);
  }

  return parts.join(' · ');
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type SimplifiedTier,
  type EvidenceQuality,
  type SimplifiedStats,

  // Constants
  SIMPLIFIED_TIERS,
  EVIDENCE_QUALITY,

  // Core functions
  getTierFromScore,
  getTierConfig,
  getNextTierInfo,
  getEvidenceQuality,
  getEvidenceQualityConfig,
  getSimplifiedStats,

  // Formatters
  formatTrackRecord,
  formatActivity,
  formatCategoryExpertise,
  formatStreak,
  formatLeaderboardPosition,
  formatTrendArrow,
  formatAuthorLine,
  formatTimeAgo,
  formatLeaderboardStats,
};
