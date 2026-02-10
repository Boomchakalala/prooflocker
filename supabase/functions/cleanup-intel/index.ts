/**
 * ProofLocker OSINT Intel System - Cleanup Edge Function
 *
 * Enforces retention policies to prevent feed/globe clutter.
 * Deletes old intel items based on TTL and caps.
 *
 * Retention Rules:
 * - INTEL_TTL_DAYS: Delete items older than N days (default: 7)
 * - INTEL_MAX_ITEMS: Global cap on total items (default: 10000)
 * - INTEL_MAX_ITEMS_PER_SOURCE: Per-source cap (default: 1000)
 *
 * Schedule: 0 */6 * * * (every 6 hours)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Retention configuration (with defaults)
const INTEL_TTL_DAYS = parseInt(Deno.env.get('INTEL_TTL_DAYS') || '7');
const INTEL_MAX_ITEMS = parseInt(Deno.env.get('INTEL_MAX_ITEMS') || '10000');
const INTEL_MAX_ITEMS_PER_SOURCE = parseInt(Deno.env.get('INTEL_MAX_ITEMS_PER_SOURCE') || '1000');

interface CleanupStats {
  ttlDeleted: number;
  globalCapDeleted: number;
  perSourceCapDeleted: number;
  totalDeleted: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const stats: CleanupStats = {
    ttlDeleted: 0,
    globalCapDeleted: 0,
    perSourceCapDeleted: 0,
    totalDeleted: 0,
    errors: [],
  };

  console.log('[Cleanup Intel] Starting cleanup run...');
  console.log(`[Cleanup Intel] Config: TTL=${INTEL_TTL_DAYS}d, MaxItems=${INTEL_MAX_ITEMS}, MaxPerSource=${INTEL_MAX_ITEMS_PER_SOURCE}`);

  try {
    // ========================================================================
    // 1. DELETE ITEMS OLDER THAN TTL
    // ========================================================================
    const ttlCutoff = new Date();
    ttlCutoff.setDate(ttlCutoff.getDate() - INTEL_TTL_DAYS);

    console.log(`[Cleanup Intel] Deleting items older than ${ttlCutoff.toISOString()}...`);

    const { data: ttlDeleted, error: ttlError } = await supabase
      .from('intel_items')
      .delete()
      .lt('created_at', ttlCutoff.toISOString())
      .select('id');

    if (ttlError) {
      stats.errors.push(`TTL deletion failed: ${ttlError.message}`);
      console.error('[Cleanup Intel] TTL deletion error:', ttlError);
    } else {
      stats.ttlDeleted = ttlDeleted?.length || 0;
      console.log(`[Cleanup Intel] Deleted ${stats.ttlDeleted} items by TTL`);
    }

    // ========================================================================
    // 2. ENFORCE GLOBAL CAP (keep newest N items)
    // ========================================================================
    console.log(`[Cleanup Intel] Enforcing global cap of ${INTEL_MAX_ITEMS} items...`);

    // Count total items
    const { count: totalCount, error: countError } = await supabase
      .from('intel_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      stats.errors.push(`Count query failed: ${countError.message}`);
      console.error('[Cleanup Intel] Count error:', countError);
    } else if (totalCount && totalCount > INTEL_MAX_ITEMS) {
      const toDelete = totalCount - INTEL_MAX_ITEMS;
      console.log(`[Cleanup Intel] Total items: ${totalCount}, need to delete ${toDelete}`);

      // Find oldest items to delete
      const { data: oldestItems, error: oldestError } = await supabase
        .from('intel_items')
        .select('id')
        .order('published_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(toDelete);

      if (oldestError) {
        stats.errors.push(`Oldest items query failed: ${oldestError.message}`);
      } else if (oldestItems && oldestItems.length > 0) {
        const idsToDelete = oldestItems.map(item => item.id);

        const { error: deleteError } = await supabase
          .from('intel_items')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          stats.errors.push(`Global cap deletion failed: ${deleteError.message}`);
        } else {
          stats.globalCapDeleted = idsToDelete.length;
          console.log(`[Cleanup Intel] Deleted ${stats.globalCapDeleted} items by global cap`);
        }
      }
    } else {
      console.log(`[Cleanup Intel] Global cap OK (${totalCount} items)`);
    }

    // ========================================================================
    // 3. ENFORCE PER-SOURCE CAP (keep newest N per source)
    // ========================================================================
    console.log(`[Cleanup Intel] Enforcing per-source cap of ${INTEL_MAX_ITEMS_PER_SOURCE} items...`);

    // Get all sources with item counts
    const { data: sourceCounts, error: sourceCountError } = await supabase
      .from('intel_items')
      .select('source_id')
      .not('source_id', 'is', null);

    if (sourceCountError) {
      stats.errors.push(`Source count query failed: ${sourceCountError.message}`);
    } else if (sourceCounts) {
      // Group by source_id
      const sourceMap = new Map<string, number>();
      sourceCounts.forEach((row: any) => {
        const count = sourceMap.get(row.source_id) || 0;
        sourceMap.set(row.source_id, count + 1);
      });

      // Check each source
      for (const [sourceId, count] of sourceMap.entries()) {
        if (count > INTEL_MAX_ITEMS_PER_SOURCE) {
          const toDelete = count - INTEL_MAX_ITEMS_PER_SOURCE;
          console.log(`[Cleanup Intel] Source ${sourceId}: ${count} items, deleting ${toDelete} oldest`);

          // Find oldest items for this source
          const { data: oldestForSource, error: oldestSourceError } = await supabase
            .from('intel_items')
            .select('id')
            .eq('source_id', sourceId)
            .order('published_at', { ascending: true, nullsFirst: true })
            .order('created_at', { ascending: true })
            .limit(toDelete);

          if (oldestSourceError) {
            stats.errors.push(`Source ${sourceId} oldest query failed: ${oldestSourceError.message}`);
          } else if (oldestForSource && oldestForSource.length > 0) {
            const idsToDelete = oldestForSource.map(item => item.id);

            const { error: deleteError } = await supabase
              .from('intel_items')
              .delete()
              .in('id', idsToDelete);

            if (deleteError) {
              stats.errors.push(`Source ${sourceId} deletion failed: ${deleteError.message}`);
            } else {
              stats.perSourceCapDeleted += idsToDelete.length;
              console.log(`[Cleanup Intel] Deleted ${idsToDelete.length} items from source ${sourceId}`);
            }
          }
        }
      }
    }

    stats.totalDeleted = stats.ttlDeleted + stats.globalCapDeleted + stats.perSourceCapDeleted;

    console.log('[Cleanup Intel] Cleanup complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup complete',
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Cleanup Intel] Fatal error:', error);
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
