import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user (admin check could be added here)
    const user = await getCurrentUser();

    // Get prediction details
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (predError || !prediction) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Validation: Must be resolved
    if (!prediction.resolved_at) {
      return NextResponse.json(
        { error: 'Claim must be resolved before finalization' },
        { status: 400 }
      );
    }

    // Validation: Already finalized
    if (prediction.is_finalized) {
      return NextResponse.json(
        { error: 'Claim is already finalized' },
        { status: 400 }
      );
    }

    // Call the finalize_prediction database function
    const { data: result, error: finalizeError } = await supabase
      .rpc('finalize_prediction', { p_id: predictionId });

    if (finalizeError) {
      console.error('Error finalizing prediction:', finalizeError);
      return NextResponse.json(
        { error: 'Failed to finalize claim' },
        { status: 500 }
      );
    }

    // Get updated prediction
    const { data: updated, error: fetchError } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (fetchError || !updated) {
      return NextResponse.json(
        { error: 'Failed to fetch updated claim' },
        { status: 500 }
      );
    }

    // If overruled, apply reputation penalty to original author
    if (updated.overruled && updated.user_id) {
      const { error: penaltyError } = await supabase.rpc('apply_overruled_penalty', {
        p_user_id: updated.user_id,
        p_penalty: 25
      });

      if (penaltyError) {
        console.error('Error applying overruled penalty:', penaltyError);
        // Don't fail the finalization if penalty fails
      }
    }

    return NextResponse.json({
      success: true,
      result: result,
      prediction: updated,
      overruled: updated.overruled,
      final_outcome: updated.final_outcome,
    });
  } catch (error) {
    console.error('Error in finalize API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get prediction finalization status
    const { data: prediction, error } = await supabase
      .from('predictions')
      .select('is_finalized, overruled, final_outcome, weighted_net, dispute_window_end, finalization_deadline, resolved_at')
      .eq('id', predictionId)
      .single();

    if (error || !prediction) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const disputeEnd = prediction.dispute_window_end ? new Date(prediction.dispute_window_end) : null;
    const deadline = prediction.finalization_deadline ? new Date(prediction.finalization_deadline) : null;

    let canFinalize = false;
    let finalizationStatus = 'pending';

    if (prediction.is_finalized) {
      finalizationStatus = 'finalized';
    } else if (!prediction.resolved_at) {
      finalizationStatus = 'not_resolved';
    } else if (disputeEnd && now < disputeEnd) {
      finalizationStatus = 'dispute_window_active';
      canFinalize = false;
    } else if (disputeEnd && now >= disputeEnd) {
      // Check thresholds
      if (prediction.weighted_net >= 12 || prediction.weighted_net <= -12) {
        canFinalize = true;
        finalizationStatus = 'ready_threshold_met';
      } else if (deadline && now >= deadline) {
        canFinalize = true;
        finalizationStatus = 'ready_timeout';
      } else {
        canFinalize = false;
        finalizationStatus = 'contested';
      }
    }

    return NextResponse.json({
      isFinalized: prediction.is_finalized,
      overruled: prediction.overruled,
      finalOutcome: prediction.final_outcome,
      weightedNet: prediction.weighted_net,
      disputeWindowEnd: prediction.dispute_window_end,
      finalizationDeadline: prediction.finalization_deadline,
      canFinalize,
      status: finalizationStatus,
    });
  } catch (error) {
    console.error('Error checking finalization status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
