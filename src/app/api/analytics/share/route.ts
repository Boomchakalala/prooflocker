import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Simple in-memory rate limiter
const shareTracking = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

function canTrackShare(predictionId: string): boolean {
  const now = Date.now();
  const lastTracked = shareTracking.get(predictionId);

  if (!lastTracked || now - lastTracked > RATE_LIMIT_MS) {
    shareTracking.set(predictionId, now);
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { predictionId } = body;

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Missing predictionId' },
        { status: 400 }
      );
    }

    // Rate limit: max 1 notification per prediction per hour
    if (!canTrackShare(predictionId)) {
      return NextResponse.json({
        success: true,
        message: 'Share tracked (rate limited)',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get prediction owner
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('user_id, text_preview, public_slug')
      .eq('id', predictionId)
      .single();

    if (predError || !prediction) {
      console.error('Prediction not found:', predError);
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Only send notification if prediction has an owner (not anonymous)
    if (prediction.user_id) {
      // Create notification for prediction owner
      const { error: notifError } = await supabase.rpc('create_notification', {
        p_user_id: prediction.user_id,
        p_type: 'share',
        p_title: 'Prediction Shared 📤',
        p_message: 'Someone shared your prediction card',
        p_icon: '📤',
        p_metadata: {
          prediction_id: predictionId,
          prediction_text: prediction.text_preview?.slice(0, 100),
        },
        p_action_url: `/proof/${prediction.public_slug}`,
      });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Share tracked',
    });
  } catch (error) {
    console.error('Error in share tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
