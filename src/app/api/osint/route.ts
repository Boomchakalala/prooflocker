/**
 * OSINT API Endpoint
 *
 * Fetches OSINT signals from database.
 * Can be extended to proxy external APIs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchOsintSignals } from '@/lib/osint-storage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get('category') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Geolocation bounds
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');

    const bounds =
      north && south && east && west
        ? {
            north: parseFloat(north),
            south: parseFloat(south),
            east: parseFloat(east),
            west: parseFloat(west),
          }
        : undefined;

    // Fetch signals
    const signals = await fetchOsintSignals({
      category,
      tags,
      bounds,
      limit,
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error in OSINT API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OSINT signals' },
      { status: 500 }
    );
  }
}
