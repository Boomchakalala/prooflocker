import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint to verify API configuration
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        supabaseUrlConfigured: !!supabaseUrl,
        serviceKeyConfigured: !!supabaseServiceKey,
        anonKeyConfigured: !!supabaseAnonKey,
      },
    };

    // Try to ping Supabase if service key is configured
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase
          .from('insight_scores')
          .select('count')
          .limit(1)
          .single();

        health.config = {
          ...health.config,
          // @ts-ignore
          databaseConnected: !error,
        };
      } catch (dbError) {
        health.config = {
          ...health.config,
          // @ts-ignore
          databaseConnected: false,
          // @ts-ignore
          databaseError: dbError instanceof Error ? dbError.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
