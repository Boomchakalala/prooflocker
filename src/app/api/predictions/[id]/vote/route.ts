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
    const { voteType } = await request.json(); // 'upvote' or 'downvote'
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate voteType
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote" or "downvote"' },
        { status: 400 }
      );
    }

    const voteValue = voteType === 'upvote' ? 1 : -1;

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
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

    // Validation: Voter must have reliability ≥ 300 for upvotes, ≥ 200 for downvotes
    const minReliability = voteType === 'upvote' ? 300 : 200;
    if (voterReliability < minReliability) {
      return NextResponse.json(
        { error: `Must have reliability score of at least ${minReliability} to ${voteType}` },
        { status: 403 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('prediction_votes')
      .select('id, vote_value')
      .eq('prediction_id', predictionId)
      .eq('voter_user_id', user.id)
      .single();

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.vote_value === voteValue) {
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
          action: 'removed',
          voteType: null,
          message: 'Vote removed',
        });
      } else {
        // Different vote type, update the existing vote
        const { error: updateError } = await supabase
          .from('prediction_votes')
          .update({
            vote_value: voteValue,
            voter_reliability_score_snapshot: voterReliability,
          })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return NextResponse.json(
            { error: 'Failed to update vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          action: 'updated',
          voteType: voteType,
          message: `Vote changed to ${voteType}`,
        });
      }
    } else {
      // Add new vote
      const { error: insertError } = await supabase
        .from('prediction_votes')
        .insert({
          prediction_id: predictionId,
          voter_user_id: user.id,
          vote_value: voteValue,
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
        action: 'added',
        voteType: voteType,
        message: `${voteType} added`,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user (optional for GET)
    const user = await getCurrentUser();

    if (!user) {
      // Get total upvotes and downvotes
      const { data: votes } = await supabase
        .from('prediction_votes')
        .select('vote_value')
        .eq('prediction_id', predictionId);

      const upvotes = votes?.filter(v => v.vote_value > 0).length || 0;
      const downvotes = votes?.filter(v => v.vote_value < 0).length || 0;

      return NextResponse.json({
        userVote: null,
        upvotes,
        downvotes,
        netScore: upvotes - downvotes,
      });
    }

    // Check if current user has voted
    const { data: existingVote } = await supabase
      .from('prediction_votes')
      .select('vote_value')
      .eq('prediction_id', predictionId)
      .eq('voter_user_id', user.id)
      .single();

    // Get total upvotes and downvotes
    const { data: votes } = await supabase
      .from('prediction_votes')
      .select('vote_value')
      .eq('prediction_id', predictionId);

    const upvotes = votes?.filter(v => v.vote_value > 0).length || 0;
    const downvotes = votes?.filter(v => v.vote_value < 0).length || 0;

    return NextResponse.json({
      userVote: existingVote ? (existingVote.vote_value > 0 ? 'upvote' : 'downvote') : null,
      upvotes,
      downvotes,
      netScore: upvotes - downvotes,
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
