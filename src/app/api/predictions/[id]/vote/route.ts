import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Calculate vote weight based on reputation score
// Formula: 1 + floor(repScore / 250), capped at 5
function calculateVoteWeight(repScore: number): number {
  return Math.min(5, 1 + Math.floor(repScore / 250));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params;
    const body = await request.json();
    const { voteType, evidenceLink, note } = body; // 'upvote' or 'downvote'
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate voteType
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote" or "downvote"' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to vote.' },
        { status: 401 }
      );
    }

    // Get prediction details
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('id, user_id, outcome, resolved_at, dispute_window_end, is_finalized')
      .eq('id', predictionId)
      .single();

    if (predError || !prediction) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Validation: Cannot vote on own prediction
    if (prediction.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own claim' },
        { status: 403 }
      );
    }

    // Validation: Prediction must be resolved
    if (!prediction.resolved_at) {
      return NextResponse.json(
        { error: 'Can only vote on resolved claims' },
        { status: 400 }
      );
    }

    // Validation: Cannot vote on finalized predictions
    if (prediction.is_finalized) {
      return NextResponse.json(
        { error: 'Cannot vote on finalized claims' },
        { status: 400 }
      );
    }

    // Validation: Check if dispute window has ended (but not finalized yet)
    const now = new Date();
    const disputeEnd = prediction.dispute_window_end ? new Date(prediction.dispute_window_end) : null;

    if (disputeEnd && now < disputeEnd) {
      // Within normal 7-day dispute window - proceed
    } else if (disputeEnd && now >= disputeEnd) {
      // Past 7 days but not finalized - check if we're still within 14-day timeout
      const finalizationDeadline = new Date(prediction.resolved_at);
      finalizationDeadline.setDate(finalizationDeadline.getDate() + 14);

      if (now >= finalizationDeadline) {
        return NextResponse.json(
          { error: 'Voting period has ended (14 days after resolution)' },
          { status: 400 }
        );
      }
    }

    // Get voter's current reputation score
    const { data: voterStats, error: statsError } = await supabase
      .from('user_stats')
      .select('reputation_score')
      .eq('user_id', user.id)
      .single();

    const voterReputation = voterStats?.reputation_score || 0;

    // Validation: Voter must have reputation ≥ 150
    if (voterReputation < 150) {
      return NextResponse.json(
        { error: 'Must have Reputation Score of at least 150 to vote on claim resolutions' },
        { status: 403 }
      );
    }

    // Calculate vote weight
    const voteWeight = calculateVoteWeight(voterReputation);

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('resolution_votes')
      .select('id, vote_type')
      .eq('prediction_id', predictionId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('resolution_votes')
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
          voteWeight: 0,
          message: 'Vote removed',
        });
      } else {
        // Different vote type, update the existing vote
        const { error: updateError } = await supabase
          .from('resolution_votes')
          .update({
            vote_type: voteType,
            vote_weight: voteWeight,
            reputation_score: voterReputation,
            evidence_link: evidenceLink || null,
            note: note || null,
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
          voteWeight: voteWeight,
          message: `Vote changed to ${voteType}`,
        });
      }
    } else {
      // Add new vote
      const { error: insertError } = await supabase
        .from('resolution_votes')
        .insert({
          prediction_id: predictionId,
          user_id: user.id,
          vote_type: voteType,
          vote_weight: voteWeight,
          reputation_score: voterReputation,
          evidence_link: evidenceLink || null,
          note: note || null,
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
        voteWeight: voteWeight,
        message: `${voteType} added (weight: ${voteWeight})`,
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

    // Get weighted vote totals from prediction
    const { data: prediction } = await supabase
      .from('predictions')
      .select('weighted_upvotes, weighted_downvotes, weighted_net, is_finalized')
      .eq('id', predictionId)
      .single();

    if (!user) {
      return NextResponse.json({
        userVote: null,
        userVoteWeight: 0,
        weightedUpvotes: prediction?.weighted_upvotes || 0,
        weightedDownvotes: prediction?.weighted_downvotes || 0,
        weightedNet: prediction?.weighted_net || 0,
        isFinalized: prediction?.is_finalized || false,
      });
    }

    // Check if current user has voted
    const { data: existingVote } = await supabase
      .from('resolution_votes')
      .select('vote_type, vote_weight')
      .eq('prediction_id', predictionId)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      userVote: existingVote?.vote_type || null,
      userVoteWeight: existingVote?.vote_weight || 0,
      weightedUpvotes: prediction?.weighted_upvotes || 0,
      weightedDownvotes: prediction?.weighted_downvotes || 0,
      weightedNet: prediction?.weighted_net || 0,
      isFinalized: prediction?.is_finalized || false,
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
