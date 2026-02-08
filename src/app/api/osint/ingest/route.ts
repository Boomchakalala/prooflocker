/**
 * OSINT Ingestion Cron API
 * Endpoint that triggers OSINT data ingestion
 * Call this every 30 minutes via cron job or Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { osintIngestionService } from '@/lib/osint-ingestion';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  // Security: Check for cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-change-this';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[OSINT Cron] Starting ingestion job...');

  try {
    // Run ingestion
    const result = await osintIngestionService.ingestNewSignals(50);

    // Cleanup old signals
    await osintIngestionService.cleanupOldSignals();

    console.log('[OSINT Cron] Job completed:', result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[OSINT Cron] Job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow POST for manual triggers
  return GET(request);
}
