/**
 * Seed Leaderboard Data
 *
 * Fake leaderboard entries for demonstration purposes while the platform builds real user base.
 * Real user stats are still calculated in the background, but not shown on leaderboard yet.
 */

export interface SeedLeaderboardEntry {
  userId: string;
  displayName: string;
  reliabilityScore: number;
  tier: string;
  winRate: number;
  resolvedCount: number;
  avgEvidenceScore: number;
  isSeedData: true;
}

export const SEED_LEADERBOARD: SeedLeaderboardEntry[] = [
  {
    userId: 'seed-user-1',
    displayName: 'anon_alpha_47',
    reliabilityScore: 847,
    tier: 'Expert',
    winRate: 89,
    resolvedCount: 67,
    avgEvidenceScore: 82,
    isSeedData: true
  },
  {
    userId: 'seed-user-2',
    displayName: 'market_oracle_91',
    reliabilityScore: 798,
    tier: 'Expert',
    winRate: 87,
    resolvedCount: 54,
    avgEvidenceScore: 78,
    isSeedData: true
  },
  {
    userId: 'seed-user-3',
    displayName: 'geoint_tracker',
    reliabilityScore: 742,
    tier: 'Trusted',
    winRate: 85,
    resolvedCount: 48,
    avgEvidenceScore: 75,
    isSeedData: true
  },
  {
    userId: 'seed-user-4',
    displayName: 'crypto_seer_23',
    reliabilityScore: 691,
    tier: 'Trusted',
    winRate: 82,
    resolvedCount: 41,
    avgEvidenceScore: 71,
    isSeedData: true
  },
  {
    userId: 'seed-user-5',
    displayName: 'anon_researcher',
    reliabilityScore: 658,
    tier: 'Trusted',
    winRate: 80,
    resolvedCount: 38,
    avgEvidenceScore: 69,
    isSeedData: true
  },
  {
    userId: 'seed-user-6',
    displayName: 'intel_hawk_88',
    reliabilityScore: 612,
    tier: 'Trusted',
    winRate: 78,
    resolvedCount: 34,
    avgEvidenceScore: 66,
    isSeedData: true
  },
  {
    userId: 'seed-user-7',
    displayName: 'macro_analyst_x',
    reliabilityScore: 587,
    tier: 'Competent',
    winRate: 76,
    resolvedCount: 31,
    avgEvidenceScore: 64,
    isSeedData: true
  },
  {
    userId: 'seed-user-8',
    displayName: 'truth_validator',
    reliabilityScore: 553,
    tier: 'Competent',
    winRate: 74,
    resolvedCount: 28,
    avgEvidenceScore: 62,
    isSeedData: true
  },
  {
    userId: 'seed-user-9',
    displayName: 'evidence_pro_42',
    reliabilityScore: 521,
    tier: 'Competent',
    winRate: 72,
    resolvedCount: 25,
    avgEvidenceScore: 59,
    isSeedData: true
  },
  {
    userId: 'seed-user-10',
    displayName: 'claim_hunter_99',
    reliabilityScore: 489,
    tier: 'Competent',
    winRate: 70,
    resolvedCount: 22,
    avgEvidenceScore: 57,
    isSeedData: true
  },
  {
    userId: 'seed-user-11',
    displayName: 'osint_specialist',
    reliabilityScore: 456,
    tier: 'Competent',
    winRate: 68,
    resolvedCount: 19,
    avgEvidenceScore: 54,
    isSeedData: true
  },
  {
    userId: 'seed-user-12',
    displayName: 'prediction_monk',
    reliabilityScore: 427,
    tier: 'Developing',
    winRate: 66,
    resolvedCount: 17,
    avgEvidenceScore: 52,
    isSeedData: true
  }
];
