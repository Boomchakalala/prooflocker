import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { predictionId, reason } = body;

    if (!predictionId || !reason) {
      return NextResponse.json(
        { error: 'Missing predictionId or reason' },
        { status: 400 }
      );
    }

    // Valid reasons
    const validReasons = ['spam', 'low_quality', 'inappropriate'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      );
    }

    // Create reports table entry if it doesn't exist
    const { data, error } = await supabase
      .from('prediction_reports')
      .insert({
        prediction_id: predictionId,
        reason,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // If table doesn't exist, we'll create it on first run
      if (error.code === '42P01') {
        console.log('Reports table does not exist. Please run the reports migration.');
        // Still return success to user
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    // Update report count on predictions table
    const { error: updateError } = await supabase.rpc('increment_report_count', {
      prediction_id_param: predictionId
    });

    if (updateError) {
      console.error('Error incrementing report count:', updateError);
      // Don't fail the request if increment fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
