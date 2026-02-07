/**
 * API Route: Link OSINT Signal as Evidence to Existing Claim
 *
 * POST /api/link-osint-evidence
 * Body: { predictionId, osintSignalId, osintData }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { predictionId, osintSignalId, osintData } = await request.json();

    if (!predictionId || !osintSignalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if evidence bundle exists for this prediction
    const { data: existingBundle } = await supabase
      .from('evidence_bundles')
      .select('id')
      .eq('prediction_id', predictionId)
      .single();

    let bundleId: string;

    if (existingBundle) {
      // Use existing bundle
      bundleId = existingBundle.id;
    } else {
      // Create new evidence bundle
      const { data: newBundle, error: bundleError } = await supabase
        .from('evidence_bundles')
        .insert({
          prediction_id: predictionId,
          submitted_by: 'user', // TODO: Get actual user ID from session
          evidence_score: 0, // Will be recalculated
          evidence_tier: 'unverified',
        })
        .select('id')
        .single();

      if (bundleError || !newBundle) {
        console.error('Error creating evidence bundle:', bundleError);
        return NextResponse.json(
          { error: 'Failed to create evidence bundle' },
          { status: 500 }
        );
      }

      bundleId = newBundle.id;
    }

    // Get the next item order
    const { data: existingItems } = await supabase
      .from('evidence_items')
      .select('item_order')
      .eq('bundle_id', bundleId)
      .order('item_order', { ascending: false })
      .limit(1);

    const nextOrder = existingItems && existingItems.length > 0
      ? existingItems[0].item_order + 1
      : 0;

    // Add OSINT as evidence item
    const { error: itemError } = await supabase
      .from('evidence_items')
      .insert({
        bundle_id: bundleId,
        item_order: nextOrder,
        item_type: 'osint_reference',
        url: osintData.sourceUrl,
        title: osintData.title,
        description: `OSINT: ${osintData.sourceName} - ${osintData.content || ''}`,
        domain_quality: 'reputable', // OSINT sources are generally reputable
        osint_signal_id: osintSignalId,
      });

    if (itemError) {
      console.error('Error adding evidence item:', itemError);
      return NextResponse.json(
        { error: 'Failed to add evidence item' },
        { status: 500 }
      );
    }

    // Recalculate evidence score
    const { data: allItems } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('bundle_id', bundleId);

    const newScore = calculateEvidenceScore(allItems || []);
    const newTier = getEvidenceTier(newScore);

    // Update bundle score
    await supabase
      .from('evidence_bundles')
      .update({
        evidence_score: newScore,
        evidence_tier: newTier,
      })
      .eq('id', bundleId);

    // Update prediction's evidence score
    await supabase
      .from('predictions')
      .update({
        evidence_score: newScore,
      })
      .eq('id', predictionId);

    return NextResponse.json({
      success: true,
      bundleId,
      newScore,
      newTier,
      message: 'OSINT signal linked as evidence successfully',
    });
  } catch (error) {
    console.error('Error in link-osint-evidence API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateEvidenceScore(items: any[]): number {
  if (items.length === 0) return 0;

  let score = 0;

  // Base score for having evidence
  score += Math.min(items.length * 20, 60);

  // Quality bonuses
  for (const item of items) {
    if (item.domain_quality === 'reputable') {
      score += 10;
    } else if (item.domain_quality === 'social') {
      score += 5;
    }

    if (item.item_type === 'screenshot' || item.item_type === 'file') {
      score += 5;
    }

    if (item.osint_signal_id) {
      score += 10; // Bonus for linking to OSINT
    }
  }

  return Math.min(score, 100);
}

function getEvidenceTier(score: number): string {
  if (score >= 76) return 'strong';
  if (score >= 51) return 'solid';
  if (score >= 26) return 'basic';
  return 'unverified';
}
