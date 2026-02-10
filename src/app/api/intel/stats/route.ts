/**
 * ProofLocker OSINT Intel Stats API
 *
 * Lightweight endpoint for checking if new intel items have arrived.
 * Used for "New items (N)" badge and "Updated Xm ago" display.
 *
 * Query Parameters:
 * - since: timestamp to check for new items after (ISO 8601)
 *
 * Returns:
 * {
 *   newCount: number,
 *   latestTimestamp: string | null,
 *   totalActive: number (within 24h window)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const since = searchParams.get('since');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get total active intel items (last 24h)
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - 24);

    const { count: totalActive, error: totalError } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', windowStart.toISOString());

    if (totalError) {
      console.error('[Intel Stats API] Total count error:', totalError);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Get latest timestamp
    const { data: latest, error: latestError } = await supabase
      .from('intel_items')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') { // Ignore "not found" error
      console.error('[Intel Stats API] Latest timestamp error:', latestError);
    }

    // Count new items since timestamp
    let newCount = 0;
    if (since) {
      const { count: newCountResult, error: newCountError } = await supabase
        .from('intel_items')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', since);

      if (newCountError) {
        console.error('[Intel Stats API] New count error:', newCountError);
      } else {
        newCount = newCountResult || 0;
      }
    }

    return NextResponse.json({
      newCount,
      latestTimestamp: latest?.created_at || null,
      totalActive: totalActive || 0,
    });
  } catch (error) {
    console.error('[Intel Stats API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
