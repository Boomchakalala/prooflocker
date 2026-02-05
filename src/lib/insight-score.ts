/**
 * Insight Score System - Constants and Configuration
 *
 * Scoring rules for ProofLocker predictions
 * Hardcoded for now, can be made env-configurable later
 */

export const INSIGHT_SCORE = {
  // Base actions
  LOCK_PREDICTION: 10,
  CLAIM_PREDICTION: 50, // One-time bonus per prediction

  // Resolve outcomes
  RESOLVE_CORRECT_BASE: 80,
  RESOLVE_CORRECT_HIGH_RISK_BONUS: 40, // Total: 120 for crypto/politics/markets
  RESOLVE_INCORRECT: -30,

  // Bonuses
  STREAK_BONUS_PER: 10, // Per consecutive correct
  CATEGORY_MASTERY_BONUS: 20, // If ≥5 correct in category
  CATEGORY_MASTERY_THRESHOLD: 5,
} as const;

// High-risk categories that earn bonus points
export const HIGH_RISK_CATEGORIES = ['Crypto', 'Politics', 'Markets', 'OSINT'] as const;

// All valid categories
export const CATEGORIES = [
  'Crypto',
  'Sports',
  'Personal',
  'Business',
  'Politics',
  'Markets',
  'Tech',
  'OSINT',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];

// Milestones and levels
export const MILESTONES = {
  NOVICE: { min: 0, max: 999, name: 'Novice' },
  FORECASTER: { min: 1000, max: 4999, name: 'Forecaster' },
  VISIONARY: { min: 5000, max: 14999, name: 'Visionary' },
  ORACLE: { min: 15000, max: Infinity, name: 'Oracle' },
} as const;

// Badges and their unlock conditions
export const BADGES = {
  // Lock milestones
  'lock-5': { name: 'Early Adopter', description: 'Locked 5 predictions', requirement: { locks_count: 5 } },
  'lock-10': { name: 'Active Predictor', description: 'Locked 10 predictions', requirement: { locks_count: 10 } },
  'lock-25': { name: 'Prediction Master', description: 'Locked 25 predictions', requirement: { locks_count: 25 } },
  'lock-50': { name: 'Century Caller', description: 'Locked 50 predictions', requirement: { locks_count: 50 } },
  'lock-100': { name: 'Centennial', description: 'Locked 100 predictions', requirement: { locks_count: 100 } },

  // Resolve milestones
  'resolve-5-correct': { name: 'First Wins', description: '5 correct resolves', requirement: { correct_resolves: 5 } },
  'resolve-10-correct': { name: 'Proven Forecaster', description: '10 correct resolves', requirement: { correct_resolves: 10 } },
  'resolve-25-correct': { name: 'Oracle Path', description: '25 correct resolves', requirement: { correct_resolves: 25 } },

  // Accuracy milestones (minimum 10 resolves)
  'accuracy-60': { name: 'Better Than Chance', description: '60%+ accuracy (min 10 resolves)', requirement: { accuracy: 60, min_resolves: 10 } },
  'accuracy-75': { name: 'High Accuracy', description: '75%+ accuracy (min 10 resolves)', requirement: { accuracy: 75, min_resolves: 10 } },
  'accuracy-90': { name: 'Near Perfect', description: '90%+ accuracy (min 10 resolves)', requirement: { accuracy: 90, min_resolves: 10 } },

  // Streak milestones
  'streak-3': { name: 'Hot Streak', description: '3 correct in a row', requirement: { streak: 3 } },
  'streak-5': { name: 'On Fire', description: '5 correct in a row', requirement: { streak: 5 } },
  'streak-10': { name: 'Unstoppable', description: '10 correct in a row', requirement: { streak: 10 } },

  // Claim milestones
  'claim-5': { name: 'Claiming Credit', description: 'Claimed 5 predictions', requirement: { claims_count: 5 } },
  'claim-10': { name: 'Verified Caller', description: 'Claimed 10 predictions', requirement: { claims_count: 10 } },
  'claim-25': { name: 'Signature Move', description: 'Claimed 25 predictions', requirement: { claims_count: 25 } },

  // Category mastery (5+ correct in category)
  'category-crypto-master': { name: 'Crypto Oracle', description: '5+ correct crypto predictions', requirement: { category: 'Crypto', correct: 5 } },
  'category-sports-master': { name: 'Sports Sage', description: '5+ correct sports predictions', requirement: { category: 'Sports', correct: 5 } },
  'category-personal-master': { name: 'Goal Crusher', description: '5+ correct personal goals', requirement: { category: 'Personal', correct: 5 } },
  'category-business-master': { name: 'Business Visionary', description: '5+ correct business predictions', requirement: { category: 'Business', correct: 5 } },
  'category-politics-master': { name: 'Political Prophet', description: '5+ correct political predictions', requirement: { category: 'Politics', correct: 5 } },
  'category-markets-master': { name: 'Market Wizard', description: '5+ correct market predictions', requirement: { category: 'Markets', correct: 5 } },
  'category-tech-master': { name: 'Tech Futurist', description: '5+ correct tech predictions', requirement: { category: 'Tech', correct: 5 } },
} as const;

export type BadgeId = keyof typeof BADGES;

/**
 * Get milestone for a given score
 */
export function getMilestone(points: number): { name: string; min: number; max: number } {
  if (points >= MILESTONES.ORACLE.min) return MILESTONES.ORACLE;
  if (points >= MILESTONES.VISIONARY.min) return MILESTONES.VISIONARY;
  if (points >= MILESTONES.FORECASTER.min) return MILESTONES.FORECASTER;
  return MILESTONES.NOVICE;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total < 1) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Check if category is high risk (earns bonus points)
 */
export function isHighRiskCategory(category: string): boolean {
  return HIGH_RISK_CATEGORIES.includes(category as any);
}

/**
 * Calculate points for resolving a prediction
 */
export function calculateResolvePoints(isCorrect: boolean, category: string, streak: number): {
  basePoints: number;
  riskBonus: number;
  streakBonus: number;
  total: number;
} {
  if (!isCorrect) {
    return {
      basePoints: INSIGHT_SCORE.RESOLVE_INCORRECT,
      riskBonus: 0,
      streakBonus: 0,
      total: INSIGHT_SCORE.RESOLVE_INCORRECT,
    };
  }

  const basePoints = INSIGHT_SCORE.RESOLVE_CORRECT_BASE;
  const riskBonus = isHighRiskCategory(category) ? INSIGHT_SCORE.RESOLVE_CORRECT_HIGH_RISK_BONUS : 0;
  const streakBonus = streak * INSIGHT_SCORE.STREAK_BONUS_PER;

  return {
    basePoints,
    riskBonus,
    streakBonus,
    total: basePoints + riskBonus + streakBonus,
  };
}

/**
 * Check if user earned category mastery bonus
 */
export function checkCategoryMastery(categoryStats: any, category: string): boolean {
  const stats = categoryStats[category];
  return stats && stats.correct >= INSIGHT_SCORE.CATEGORY_MASTERY_THRESHOLD;
}

/**
 * Get newly earned badges based on current stats
 */
export function getNewlyEarnedBadges(
  currentBadges: string[],
  stats: {
    locks_count: number;
    claims_count: number;
    correct_resolves: number;
    total_resolves: number;
    best_streak: number;
    category_stats: any;
  }
): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const accuracy = calculateAccuracy(stats.correct_resolves, stats.total_resolves);

  for (const [badgeId, badge] of Object.entries(BADGES)) {
    if (currentBadges.includes(badgeId)) continue; // Already earned

    const req = badge.requirement;

    // Check lock milestones
    if ('locks_count' in req && stats.locks_count >= req.locks_count) {
      newBadges.push(badgeId as BadgeId);
      continue;
    }

    // Check resolve milestones
    if ('correct_resolves' in req && stats.correct_resolves >= req.correct_resolves) {
      newBadges.push(badgeId as BadgeId);
      continue;
    }

    // Check accuracy milestones
    if ('accuracy' in req && 'min_resolves' in req) {
      if (stats.total_resolves >= req.min_resolves && accuracy >= req.accuracy) {
        newBadges.push(badgeId as BadgeId);
        continue;
      }
    }

    // Check streak milestones
    if ('streak' in req && stats.best_streak >= req.streak) {
      newBadges.push(badgeId as BadgeId);
      continue;
    }

    // Check claim milestones
    if ('claims_count' in req && stats.claims_count >= req.claims_count) {
      newBadges.push(badgeId as BadgeId);
      continue;
    }

    // Check category mastery
    if ('category' in req && 'correct' in req) {
      const catStats = stats.category_stats[req.category];
      if (catStats && catStats.correct >= req.correct) {
        newBadges.push(badgeId as BadgeId);
        continue;
      }
    }
  }

  return newBadges;
}
