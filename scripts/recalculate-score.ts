/**
 * Recalculate Reputation Score Script
 * Run this to update insight_scores for users who resolved claims before the fix
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recalculateUserScore(anonId: string) {
  console.log(`\n[Recalculate] Processing user: ${anonId}`);

  // Get all predictions for this user
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('id, outcome, category')
    .eq('anon_id', anonId);

  if (error) {
    console.error(`[Recalculate] Error fetching predictions:`, error);
    return;
  }

  if (!predictions || predictions.length === 0) {
    console.log(`[Recalculate] No predictions found for ${anonId}`);
    return;
  }

  // Calculate stats
  const correct = predictions.filter(p => p.outcome === 'correct').length;
  const incorrect = predictions.filter(p => p.outcome === 'incorrect').length;
  const total = correct + incorrect;

  if (total === 0) {
    console.log(`[Recalculate] No resolved predictions for ${anonId}`);
    return;
  }

  // Calculate points
  // Base: 100 pts per correct, -20 pts per incorrect
  const basePoints = (correct * 100) - (incorrect * 20);
  // Accuracy bonus: up to 100 pts for high accuracy
  const accuracy = correct / total;
  const accuracyBonus = Math.floor(accuracy * 100);
  // Volume bonus: up to 50 pts for having many resolves
  const volumeBonus = Math.min(Math.floor(total * 5), 50);

  const totalPoints = Math.max(0, basePoints + accuracyBonus + volumeBonus);

  console.log(`[Recalculate] Stats:`, {
    correct,
    incorrect,
    total,
    accuracy: `${(accuracy * 100).toFixed(1)}%`,
    basePoints,
    accuracyBonus,
    volumeBonus,
    totalPoints
  });

  // Update or insert insight_scores
  const { data: existing } = await supabase
    .from('insight_scores')
    .select('id')
    .eq('anon_id', anonId)
    .single();

  if (existing) {
    // Update existing
    const { error: updateError } = await supabase
      .from('insight_scores')
      .update({
        total_points: totalPoints,
        correct_resolves: correct,
        incorrect_resolves: incorrect,
        total_resolves: total,
        updated_at: new Date().toISOString(),
      })
      .eq('anon_id', anonId);

    if (updateError) {
      console.error(`[Recalculate] Error updating:`, updateError);
    } else {
      console.log(`[Recalculate] ✅ Updated score to ${totalPoints} points`);
    }
  } else {
    // Insert new
    const { error: insertError } = await supabase
      .from('insight_scores')
      .insert({
        anon_id: anonId,
        total_points: totalPoints,
        correct_resolves: correct,
        incorrect_resolves: incorrect,
        total_resolves: total,
        current_streak: 0,
        best_streak: 0,
        category_stats: {},
        badges: [],
        locks_count: predictions.length,
        claims_count: predictions.length,
      });

    if (insertError) {
      console.error(`[Recalculate] Error inserting:`, insertError);
    } else {
      console.log(`[Recalculate] ✅ Created score with ${totalPoints} points`);
    }
  }
}

// Main execution
const targetAnonId = '2e6adc9f-fac8-4499-be2d-cd36983018b6'; // Your anonId
recalculateUserScore(targetAnonId)
  .then(() => console.log('\n[Recalculate] Done!'))
  .catch(err => console.error('\n[Recalculate] Fatal error:', err));
