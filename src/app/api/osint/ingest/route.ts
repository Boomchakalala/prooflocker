/**
 * Intel Ingestion Cron API
 * Fetches RSS feeds from intel_sources → intel_items table
 * Runs every 10 minutes via Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 300;

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

function parseRSS(xml: string): { title: string; url: string; summary: string | null; published_at: string }[] {
  const items: { title: string; url: string; summary: string | null; published_at: string }[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi);
  if (!itemMatches) return items;

  for (const itemXml of itemMatches) {
    const getTag = (tag: string): string | null => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : null;
    };

    const title = getTag('title');
    const link = getTag('link') || getTag('guid');
    const description = getTag('description');
    const pubDate = getTag('pubDate');

    if (title && link) {
      items.push({
        title,
        url: link,
        summary: description ? description.replace(/<[^>]+>/g, '').slice(0, 500) : null,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  return items;
}

async function fetchUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  // Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('[Intel Cron] Starting ingestion...');

  try {
    // Get enabled sources, oldest-polled first
    const { data: sources, error: srcError } = await supabase
      .from('intel_sources')
      .select('*')
      .eq('enabled', true)
      .order('last_polled_at', { ascending: true, nullsFirst: true })
      .limit(15);

    if (srcError || !sources) {
      console.error('[Intel Cron] Failed to fetch sources:', srcError);
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
    }

    let totalInserted = 0;
    const results: { source: string; fetched: number; inserted: number }[] = [];

    for (const source of sources) {
      try {
        const xml = await fetchUrl(source.url);
        const items = parseRSS(xml);

        let inserted = 0;
        for (const item of items.slice(0, 10)) {
          const urlHash = hashUrl(item.url);

          // Dedupe check
          const { data: existing } = await supabase
            .from('intel_items')
            .select('id')
            .eq('url_hash', urlHash)
            .single();

          if (existing) continue;

          const { error: insertErr } = await supabase
            .from('intel_items')
            .insert({
              source_name: source.name,
              source_type: source.type,
              title: item.title,
              url: item.url,
              url_hash: urlHash,
              published_at: item.published_at,
              summary: item.summary,
              tags: source.tags || [],
              country_code: 'US',
            });

          if (!insertErr) inserted++;
        }

        // Update last polled
        await supabase
          .from('intel_sources')
          .update({ last_polled_at: new Date().toISOString() })
          .eq('id', source.id);

        totalInserted += inserted;
        results.push({ source: source.name, fetched: items.length, inserted });
      } catch (err) {
        console.error(`[Intel Cron] Error fetching ${source.name}:`, err);
        results.push({ source: source.name, fetched: 0, inserted: 0 });
      }
    }

    // Cleanup: delete items older than 7 days, keep max 5000
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    await supabase.from('intel_items').delete().lt('created_at', weekAgo);

    console.log(`[Intel Cron] Done. Inserted ${totalInserted} new items from ${sources.length} sources.`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sourcesProcessed: sources.length,
      totalInserted,
      results,
    });
  } catch (error) {
    console.error('[Intel Cron] Fatal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
