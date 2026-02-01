/**
 * Insight Score System - Type Definitions
 */

import { Category, BadgeId } from './insight-score';

/**
 * Insight Score record (user's aggregate score data)
 */
export interface InsightScore {
  id: string;
  anonId?: string; // Anonymous user ID
  userId?: string; // Authenticated user ID
  totalPoints: number;
  correctResolves: number;
  incorrectResolves: number;
  totalResolves: number;
  currentStreak: number;
  bestStreak: number;
  lastResolveTs?: string;
  createdAt: string;
  updatedAt: string;
  categoryStats: CategoryStats;
  badges: BadgeId[];
  locksCount: number;
  claimsCount: number;
}

/**
 * Category-specific statistics
 */
export interface CategoryStats {
  [category: string]: {
    correct: number;
    total: number;
    points: number;
  };
}

/**
 * Insight action (logged scoring event)
 */
export interface InsightAction {
  id: string;
  anonId?: string;
  userId?: string;
  actionType: 'lock' | 'claim' | 'resolve_correct' | 'resolve_incorrect' | 'streak' | 'category_mastery';
  pointsDelta: number;
  predictionId?: string;
  category?: Category;
  streakCount?: number;
  metadata?: {
    riskBonus?: number;
    categoryMasteryBonus?: number;
    [key: string]: any;
  };
  createdAt: string;
}

/**
 * Database row structure for insight_scores table
 */
export interface InsightScoreRow {
  id: string;
  anon_id: string | null;
  user_id: string | null;
  total_points: number;
  correct_resolves: number;
  incorrect_resolves: number;
  total_resolves: number;
  current_streak: number;
  best_streak: number;
  last_resolve_ts: string | null;
  created_at: string;
  updated_at: string;
  category_stats: any; // JSONB
  badges: string[];
  locks_count: number;
  claims_count: number;
}

/**
 * Database row structure for insight_actions table
 */
export interface InsightActionRow {
  id: string;
  anon_id: string | null;
  user_id: string | null;
  action_type: string;
  points_delta: number;
  prediction_id: string | null;
  category: string | null;
  streak_count: number | null;
  metadata: any; // JSONB
  created_at: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  displayName: string; // "Anon #1234" or custom pseudonym
  anonId?: string;
  userId?: string;
  totalPoints: number;
  accuracy: number;
  correctResolves: number;
  totalResolves: number;
  currentStreak: number;
}

/**
 * API response for current user's insight score
 */
export interface InsightScoreResponse {
  score: InsightScore;
  rank?: number;
  totalUsers: number;
  accuracy: number;
  milestone: {
    name: string;
    min: number;
    max: number;
  };
}

/**
 * API response for leaderboard
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Convert database row to InsightScore object
 */
export function rowToInsightScore(row: InsightScoreRow): InsightScore {
  return {
    id: row.id,
    anonId: row.anon_id || undefined,
    userId: row.user_id || undefined,
    totalPoints: row.total_points,
    correctResolves: row.correct_resolves,
    incorrectResolves: row.incorrect_resolves,
    totalResolves: row.total_resolves,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastResolveTs: row.last_resolve_ts || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryStats: row.category_stats || {},
    badges: (row.badges as BadgeId[]) || [],
    locksCount: row.locks_count,
    claimsCount: row.claims_count,
  };
}

/**
 * Convert database row to InsightAction object
 */
export function rowToInsightAction(row: InsightActionRow): InsightAction {
  return {
    id: row.id,
    anonId: row.anon_id || undefined,
    userId: row.user_id || undefined,
    actionType: row.action_type as any,
    pointsDelta: row.points_delta,
    predictionId: row.prediction_id || undefined,
    category: row.category as Category | undefined,
    streakCount: row.streak_count || undefined,
    metadata: row.metadata || undefined,
    createdAt: row.created_at,
  };
}
