/**
 * Insight Score - Database Operations Utility
 * Helper functions for updating scores and logging actions
 */

import { createClient } from "@supabase/supabase-js";
import {
  INSIGHT_SCORE,
  calculateResolvePoints,
  isHighRiskCategory,
  getNewlyEarnedBadges,
  INSIGHT_SCORE as SCORES,
} from "./insight-score";
import { InsightScoreRow } from "./insight-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Get or create insight score record
 */
export async function getOrCreateScore(
  identifier: { anonId?: string; userId?: string }
): Promise<InsightScoreRow | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let query = supabase.from("insight_scores").select("*");

  if (identifier.userId) {
    query = query.eq("user_id", identifier.userId);
  } else if (identifier.anonId) {
    query = query.eq("anon_id", identifier.anonId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching score:", error);
    return null;
  }

  // Create if doesn't exist
  if (!data) {
    const newScore: Partial<InsightScoreRow> = {
      // IMPORTANT: Only set ONE identifier (user_id OR anon_id, never both)
      anon_id: identifier.userId ? null : (identifier.anonId || null),
      user_id: identifier.userId || null,
      total_points: 0,
      correct_resolves: 0,
      incorrect_resolves: 0,
      total_resolves: 0,
      current_streak: 0,
      best_streak: 0,
      category_stats: {},
      badges: [],
      locks_count: 0,
      claims_count: 0,
    };

    const { data: created, error: createError } = await supabase
      .from("insight_scores")
      .insert(newScore)
      .select()
      .single();

    if (createError) {
      console.error("Error creating score:", createError);
      return null;
    }

    return created;
  }

  return data;
}

/**
 * Log an insight action
 */
export async function logAction(params: {
  identifier: { anonId?: string; userId?: string };
  actionType: string;
  pointsDelta: number;
  predictionId?: string;
  category?: string;
  streakCount?: number;
  metadata?: any;
}): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  await supabase.from("insight_actions").insert({
    // IMPORTANT: Only set ONE identifier (user_id OR anon_id, never both)
    anon_id: params.identifier.userId ? null : (params.identifier.anonId || null),
    user_id: params.identifier.userId || null,
    action_type: params.actionType,
    points_delta: params.pointsDelta,
    prediction_id: params.predictionId || null,
    category: params.category || null,
    streak_count: params.streakCount || null,
    metadata: params.metadata || null,
  });
}

/**
 * Award points for locking a prediction
 */
export async function awardLockPoints(
  identifier: { anonId?: string; userId?: string },
  predictionId: string
): Promise<{ points: number; newTotal: number } | null> {
  const score = await getOrCreateScore(identifier);
  if (!score) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Update score
  const newLocksCount = score.locks_count + 1;
  const newTotal = score.total_points + INSIGHT_SCORE.LOCK_PREDICTION;

  const { data: updated, error } = await supabase
    .from("insight_scores")
    .update({
      total_points: newTotal,
      locks_count: newLocksCount,
    })
    .eq("id", score.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating score for lock:", error);
    return null;
  }

  // Check for new badges
  const newBadges = getNewlyEarnedBadges(score.badges, {
    locks_count: newLocksCount,
    claims_count: score.claims_count,
    correct_resolves: score.correct_resolves,
    total_resolves: score.total_resolves,
    best_streak: score.best_streak,
    category_stats: score.category_stats,
  });

  if (newBadges.length > 0) {
    await supabase
      .from("insight_scores")
      .update({
        badges: [...score.badges, ...newBadges],
      })
      .eq("id", score.id);
  }

  // Log action
  await logAction({
    identifier,
    actionType: "lock",
    pointsDelta: INSIGHT_SCORE.LOCK_PREDICTION,
    predictionId,
  });

  return {
    points: INSIGHT_SCORE.LOCK_PREDICTION,
    newTotal,
  };
}

/**
 * Award points for claiming a prediction
 */
export async function awardClaimPoints(
  identifier: { anonId?: string; userId?: string },
  predictionId: string
): Promise<{ points: number; newTotal: number } | null> {
  const score = await getOrCreateScore(identifier);
  if (!score) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Update score
  const newClaimsCount = score.claims_count + 1;
  const newTotal = score.total_points + INSIGHT_SCORE.CLAIM_PREDICTION;

  const { error } = await supabase
    .from("insight_scores")
    .update({
      total_points: newTotal,
      claims_count: newClaimsCount,
    })
    .eq("id", score.id);

  if (error) {
    console.error("Error updating score for claim:", error);
    return null;
  }

  // Check for new badges
  const newBadges = getNewlyEarnedBadges(score.badges, {
    locks_count: score.locks_count,
    claims_count: newClaimsCount,
    correct_resolves: score.correct_resolves,
    total_resolves: score.total_resolves,
    best_streak: score.best_streak,
    category_stats: score.category_stats,
  });

  if (newBadges.length > 0) {
    await supabase
      .from("insight_scores")
      .update({
        badges: [...score.badges, ...newBadges],
      })
      .eq("id", score.id);
  }

  // Log action
  await logAction({
    identifier,
    actionType: "claim",
    pointsDelta: INSIGHT_SCORE.CLAIM_PREDICTION,
    predictionId,
  });

  return {
    points: INSIGHT_SCORE.CLAIM_PREDICTION,
    newTotal,
  };
}

/**
 * Award points for resolving a prediction
 */
export async function awardResolvePoints(params: {
  identifier: { anonId?: string; userId?: string };
  predictionId: string;
  isCorrect: boolean;
  category: string;
}): Promise<{
  points: number;
  breakdown: { basePoints: number; riskBonus: number; streakBonus: number; categoryMasteryBonus: number };
  newTotal: number;
  newStreak: number;
} | null> {
  const score = await getOrCreateScore(params.identifier);
  if (!score) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Calculate points
  const newStreak = params.isCorrect ? score.current_streak + 1 : 0;
  const breakdown = calculateResolvePoints(params.isCorrect, params.category, newStreak);

  // Update category stats
  const categoryStats = { ...score.category_stats };
  if (!categoryStats[params.category]) {
    categoryStats[params.category] = { correct: 0, total: 0, points: 0 };
  }
  categoryStats[params.category].total += 1;
  if (params.isCorrect) {
    categoryStats[params.category].correct += 1;
  }
  categoryStats[params.category].points += breakdown.total;

  // Check for category mastery bonus (first time reaching 5 correct in category)
  let categoryMasteryBonus = 0;
  if (
    params.isCorrect &&
    categoryStats[params.category].correct === SCORES.CATEGORY_MASTERY_THRESHOLD
  ) {
    categoryMasteryBonus = SCORES.CATEGORY_MASTERY_BONUS;
  }

  const totalPoints = breakdown.total + categoryMasteryBonus;

  // Update score
  const newTotal = score.total_points + totalPoints;
  const newCorrect = params.isCorrect ? score.correct_resolves + 1 : score.correct_resolves;
  const newIncorrect = params.isCorrect ? score.incorrect_resolves : score.incorrect_resolves + 1;
  const newTotalResolves = score.total_resolves + 1;
  const newBestStreak = Math.max(score.best_streak, newStreak);

  const { error } = await supabase
    .from("insight_scores")
    .update({
      total_points: newTotal,
      correct_resolves: newCorrect,
      incorrect_resolves: newIncorrect,
      total_resolves: newTotalResolves,
      current_streak: newStreak,
      best_streak: newBestStreak,
      last_resolve_ts: new Date().toISOString(),
      category_stats: categoryStats,
    })
    .eq("id", score.id);

  if (error) {
    console.error("Error updating score for resolve:", error);
    return null;
  }

  // Check for new badges
  const newBadges = getNewlyEarnedBadges(score.badges, {
    locks_count: score.locks_count,
    claims_count: score.claims_count,
    correct_resolves: newCorrect,
    total_resolves: newTotalResolves,
    best_streak: newBestStreak,
    category_stats: categoryStats,
  });

  if (newBadges.length > 0) {
    await supabase
      .from("insight_scores")
      .update({
        badges: [...score.badges, ...newBadges],
      })
      .eq("id", score.id);
  }

  // Log action
  await logAction({
    identifier: params.identifier,
    actionType: params.isCorrect ? "resolve_correct" : "resolve_incorrect",
    pointsDelta: totalPoints,
    predictionId: params.predictionId,
    category: params.category,
    streakCount: newStreak,
    metadata: {
      riskBonus: breakdown.riskBonus,
      categoryMasteryBonus,
    },
  });

  return {
    points: totalPoints,
    breakdown: {
      basePoints: breakdown.basePoints,
      riskBonus: breakdown.riskBonus,
      streakBonus: breakdown.streakBonus,
      categoryMasteryBonus,
    },
    newTotal,
    newStreak,
  };
}

/**
 * Migrate anon score to authenticated user
 * Called when user claims predictions and signs in
 */
export async function migrateAnonScoreToUser(
  anonId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get anon score
  const { data: anonScore } = await supabase
    .from("insight_scores")
    .select("*")
    .eq("anon_id", anonId)
    .maybeSingle();

  if (!anonScore) return true; // Nothing to migrate

  // Check if user already has a score
  const { data: userScore } = await supabase
    .from("insight_scores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (userScore) {
    // Merge scores (add anon to user)
    const mergedCategoryStats = { ...userScore.category_stats };
    Object.keys(anonScore.category_stats).forEach((cat: string) => {
      if (!mergedCategoryStats[cat]) {
        mergedCategoryStats[cat] = anonScore.category_stats[cat];
      } else {
        mergedCategoryStats[cat].correct += anonScore.category_stats[cat].correct;
        mergedCategoryStats[cat].total += anonScore.category_stats[cat].total;
        mergedCategoryStats[cat].points += anonScore.category_stats[cat].points;
      }
    });

    const mergedBadges = Array.from(new Set([...userScore.badges, ...anonScore.badges]));

    await supabase
      .from("insight_scores")
      .update({
        total_points: userScore.total_points + anonScore.total_points,
        correct_resolves: userScore.correct_resolves + anonScore.correct_resolves,
        incorrect_resolves: userScore.incorrect_resolves + anonScore.incorrect_resolves,
        total_resolves: userScore.total_resolves + anonScore.total_resolves,
        current_streak: Math.max(userScore.current_streak, anonScore.current_streak),
        best_streak: Math.max(userScore.best_streak, anonScore.best_streak),
        locks_count: userScore.locks_count + anonScore.locks_count,
        claims_count: userScore.claims_count + anonScore.claims_count,
        category_stats: mergedCategoryStats,
        badges: mergedBadges,
      })
      .eq("id", userScore.id);

    // Delete anon score
    await supabase.from("insight_scores").delete().eq("id", anonScore.id);
  } else {
    // Just update anon score to user
    await supabase
      .from("insight_scores")
      .update({
        user_id: userId,
        anon_id: null,
      })
      .eq("id", anonScore.id);
  }

  // Update actions
  await supabase
    .from("insight_actions")
    .update({
      user_id: userId,
      anon_id: null,
    })
    .eq("anon_id", anonId);

  return true;
}
