/**
 * ProofLocker OSINT Intel System - Ingestion Edge Function
 *
 * Fetches RSS feeds from enabled intel_sources and ingests items into intel_items.
 * Runs every 5-10 minutes via Supabase Cron.
 *
 * Features:
 * - Robust RSS/Atom parsing
 * - URL canonicalization and deduplication
 * - Google News redirect resolution
 * - GeoRSS coordinate extraction
 * - Graceful error handling (one bad source doesn't fail entire run)
 *
 * Schedule: */10 * * * * (every 10 minutes)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  canonicalizeUrl,
  resolveGoogleNewsUrl,
  hashUrl,
  parseFeed,
  type ParsedFeedItem,
} from '../_shared/intel-utils.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface IngestStats {
  sourcesProcessed: number;
  sourcesFailed: number;
  itemsFetched: number;
  itemsInserted: number;
  itemsUpdated: number;
  errors: string[];
}

serve(async (req) => {
  // Only allow POST from cron or internal calls
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const stats: IngestStats = {
    sourcesProcessed: 0,
    sourcesFailed: 0,
    itemsFetched: 0,
    itemsInserted: 0,
    itemsUpdated: 0,
    errors: [],
  };

  console.log('[Ingest Intel] Starting ingestion run...');

  try {
    // Fetch enabled sources
    const { data: sources, error: sourcesError } = await supabase
      .from('intel_sources')
      .select('*')
      .eq('enabled', true)
      .in('type', ['google_news_rss', 'rss']);

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      console.log('[Ingest Intel] No enabled sources found');
      return new Response(JSON.stringify({ success: true, message: 'No sources to process', stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Ingest Intel] Processing ${sources.length} sources...`);

    // Process each source
    for (const source of sources) {
      try {
        console.log(`[Ingest Intel] Fetching source: ${source.name}`);

        // Fetch RSS feed
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'ProofLocker/1.0 (+https://prooflocker.io)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();

        // Parse feed
        const feedItems = parseFeed(xmlText);
        stats.itemsFetched += feedItems.length;

        console.log(`[Ingest Intel] Parsed ${feedItems.length} items from ${source.name}`);

        // Process each feed item
        for (const item of feedItems) {
          try {
            // Canonicalize URL
            let canonicalUrl = canonicalizeUrl(item.url);

            // Resolve Google News redirects
            if (source.type === 'google_news_rss' && item.url.includes('news.google.com')) {
              const resolved = await resolveGoogleNewsUrl(item.url);
              if (resolved) {
                canonicalUrl = canonicalizeUrl(resolved);
              }
            }

            // Generate hash for deduplication
            const urlHash = hashUrl(canonicalUrl);

            // Prepare intel item
            const intelItem = {
              source_id: source.id,
              source_name: source.name,
              source_type: source.type,
              title: item.title.slice(0, 500), // Limit title length
              url: item.url,
              canonical_url: canonicalUrl !== item.url ? canonicalUrl : null,
              url_hash: urlHash,
              published_at: item.publishedAt?.toISOString() || null,
              summary: item.summary?.slice(0, 1000) || null, // Limit summary length
              author: item.author?.slice(0, 200) || null,
              image_url: item.imageUrl,
              tags: source.tags || [],
              // GeoRSS coordinates if available
              lat: item.geoRss?.lat || null,
              lon: item.geoRss?.lon || null,
              geo_confidence: item.geoRss ? 100 : null,
              geo_method: item.geoRss ? 'georss' : null,
              raw: {
                feed_item: item,
                ingested_at: new Date().toISOString(),
              },
            };

            // Upsert item (insert or update on conflict)
            const { error: upsertError } = await supabase
              .from('intel_items')
              .upsert(intelItem, {
                onConflict: 'url_hash',
                ignoreDuplicates: false, // Update if exists
              });

            if (upsertError) {
              console.warn(`[Ingest Intel] Failed to upsert item: ${upsertError.message}`);
              stats.errors.push(`Upsert failed for ${item.title}: ${upsertError.message}`);
            } else {
              stats.itemsInserted++;
            }
          } catch (itemError) {
            console.warn(`[Ingest Intel] Error processing item: ${itemError}`);
            stats.errors.push(`Item processing error: ${itemError.message}`);
          }
        }

        // Update last_polled_at for source
        await supabase
          .from('intel_sources')
          .update({ last_polled_at: new Date().toISOString() })
          .eq('id', source.id);

        stats.sourcesProcessed++;
      } catch (sourceError) {
        console.error(`[Ingest Intel] Error processing source ${source.name}:`, sourceError);
        stats.sourcesFailed++;
        stats.errors.push(`Source ${source.name}: ${sourceError.message}`);
      }
    }

    console.log('[Ingest Intel] Ingestion complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ingestion complete',
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Ingest Intel] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stats,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
