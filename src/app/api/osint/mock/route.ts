/**
 * Mock OSINT API Endpoint
 *
 * Returns mock OSINT signals for testing.
 * Replace with real API integration later.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { OsintSignal } from '@/lib/osint-types';

const MOCK_SIGNALS: Omit<OsintSignal, 'id' | 'createdAt'>[] = [
  {
    title: 'Breaking: Increased military activity reported near Tehran',
    content: 'Multiple sources reporting heightened military presence in the Tehran region. Situation developing.',
    sourceName: 'Reuters',
    sourceUrl: 'https://reuters.com/article/example-1',
    geotagLat: 35.6892,
    geotagLng: 51.3890,
    locationName: 'Tehran, Iran',
    tags: ['conflict', 'iran', 'military', 'breaking'],
    category: 'Politics',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 85,
  },
  {
    title: 'Major tech company announces AI breakthrough',
    content: 'Leading tech firm reveals new artificial intelligence model with unprecedented capabilities.',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/article/example-2',
    geotagLat: 37.7749,
    geotagLng: -122.4194,
    locationName: 'San Francisco, CA',
    tags: ['technology', 'ai', 'breaking'],
    category: 'Technology',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 90,
  },
  {
    title: 'Tensions rise in South China Sea',
    content: 'Naval vessels from multiple nations conducting exercises in disputed waters.',
    sourceName: 'Conflict Radar',
    sourceHandle: '@conflict_radar',
    sourceUrl: 'https://twitter.com/conflict_radar/status/example-3',
    geotagLat: 16.0,
    geotagLng: 114.0,
    locationName: 'South China Sea',
    tags: ['conflict', 'naval', 'china', 'international'],
    category: 'Politics',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 75,
  },
  {
    title: 'Cryptocurrency market experiences volatility',
    content: 'Major digital assets showing significant price movements amid regulatory concerns.',
    sourceName: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/article/example-4',
    geotagLat: 40.7128,
    geotagLng: -74.0060,
    locationName: 'New York, NY',
    tags: ['crypto', 'finance', 'markets'],
    category: 'Markets',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 80,
  },
  {
    title: 'Natural disaster warning issued for coastal region',
    content: 'Authorities urge evacuation as severe weather system approaches.',
    sourceName: 'Weather Channel',
    sourceUrl: 'https://weather.com/article/example-5',
    geotagLat: 25.7617,
    geotagLng: -80.1918,
    locationName: 'Miami, FL',
    tags: ['weather', 'disaster', 'emergency'],
    category: 'Environment',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 95,
  },
  {
    title: 'Space agency announces mission to Mars',
    content: 'New interplanetary mission scheduled for next launch window.',
    sourceName: 'Space News',
    sourceUrl: 'https://spacenews.com/article/example-6',
    geotagLat: 28.5728,
    geotagLng: -80.6490,
    locationName: 'Cape Canaveral, FL',
    tags: ['space', 'science', 'mars'],
    category: 'Science',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    ingestedAt: new Date().toISOString(),
    confidenceScore: 88,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '100');

  // Generate mock signals with IDs
  let signals: OsintSignal[] = MOCK_SIGNALS.map((signal, index) => ({
    ...signal,
    id: `mock-osint-${index + 1}`,
    createdAt: signal.publishedAt,
  }));

  // Apply category filter
  if (category && category !== 'all') {
    signals = signals.filter((s) => s.category === category);
  }

  // Apply limit
  signals = signals.slice(0, limit);

  return NextResponse.json(signals);
}
