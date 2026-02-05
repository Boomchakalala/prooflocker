import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get prediction details
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('id, user_id, outcome, resolved_at')
      .eq('id', predictionId)
      .single();

    if (predError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Validation: Prediction must be resolved
    if (prediction.outcome !== 'correct' && prediction.outcome !== 'incorrect') {
      return NextResponse.json(
        { error: 'Can only vote on resolved predictions' },
        { status: 400 }
      );
    }

    // Validation: Cannot vote on own prediction
    if (prediction.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own prediction' },
        { status: 403 }
      );
    }

    // Get voter's current reliability score
    const { data: voterStats, error: statsError } = await supabase
      .from('user_stats')
      .select('reliability_score')
      .eq('user_id', user.id)
      .single();

    const voterReliability = voterStats?.reliability_score || 0;

    // Validation: Voter must have reliability ≥ 300
    if (voterReliability < 300) {
      return NextResponse.json(
        { error: 'Must have reliability score of at least 300 to vote' },
        { status: 403 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('prediction_votes')
      .select('id')
      .eq('prediction_id', predictionId)
      .eq('voter_user_id', user.id)
      .single();

    if (existingVote) {
      // Toggle: Remove the vote
      const { error: deleteError } = await supabase
        .from('prediction_votes')
        .delete()
        .eq('id', existingVote.id);

      if (deleteError) {
        console.error('Error removing vote:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove vote' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        voted: false,
        message: 'Vote removed',
      });
    } else {
      // Add new vote
      const { error: insertError } = await supabase
        .from('prediction_votes')
        .insert({
          prediction_id: predictionId,
          voter_user_id: user.id,
          vote_value: 1,
          voter_reliability_score_snapshot: voterReliability,
        });

      if (insertError) {
        console.error('Error adding vote:', insertError);
        return NextResponse.json(
          { error: 'Failed to add vote' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        voted: true,
        message: 'Vote added',
      });
    }
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id;
    const supabase = await createClient();

    // Get current user (optional for GET)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        voted: false,
        voteCount: 0,
      });
    }

    // Check if current user has voted
    const { data: existingVote } = await supabase
      .from('prediction_votes')
      .select('id')
      .eq('prediction_id', predictionId)
      .eq('voter_user_id', user.id)
      .single();

    // Get vote count for this prediction
    const { data: prediction } = await supabase
      .from('predictions')
      .select('vote_count')
      .eq('id', predictionId)
      .single();

    return NextResponse.json({
      voted: !!existingVote,
      voteCount: prediction?.vote_count || 0,
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
