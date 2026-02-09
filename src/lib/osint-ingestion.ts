/**
 * OSINT Ingestion Service
 * Orchestrates fetching, processing, and storing OSINT signals
 */

import { createClient } from '@supabase/supabase-js';
import { newsAggregator } from './news-aggregator';
import { locationExtractor } from './location-extractor';

export class OsintIngestionService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // During build time, env vars might not be available - create placeholder
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[OsintIngestion] Supabase credentials not available (build time)');
      // Create a dummy client that will fail gracefully if used
      this.supabase = null as any;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Get Supabase client, initializing if needed
   */
  private getSupabase() {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  /**
   * Main ingestion process
   */
  async ingestNewSignals(limit: number = 50) {
    console.log('[OsintIngestion] Starting ingestion process...');

    try {
      // Step 1: Fetch articles from all sources
      const articles = await newsAggregator.fetchAll(limit);
      console.log(`[OsintIngestion] Fetched ${articles.length} articles`);

      if (articles.length === 0) {
        console.log('[OsintIngestion] No articles to process');
        return { success: true, processed: 0, inserted: 0 };
      }

      // Step 2: Check for existing articles (deduplication)
      const hashes = articles.map((a) => a.content_hash);
      const { data: existing } = await this.getSupabase()
        .from('osint_signals')
        .select('content_hash')
        .in('content_hash', hashes);

      const existingHashes = new Set((existing || []).map((e: any) => e.content_hash));
      const newArticles = articles.filter((a) => !existingHashes.has(a.content_hash));

      console.log(
        `[OsintIngestion] ${newArticles.length} new articles (${existingHashes.size} duplicates skipped)`
      );

      if (newArticles.length === 0) {
        return { success: true, processed: articles.length, inserted: 0 };
      }

      // Step 3: Extract location data using AI (batch process for efficiency)
      console.log('[OsintIngestion] Extracting locations with AI...');
      const locationData = await locationExtractor.extractBatch(
        newArticles.map((a) => ({ title: a.title, content: a.content }))
      );

      // Step 4: Prepare records for insertion
      const records = newArticles.map((article, index) => {
        const location = locationData[index];

        return {
          title: article.title.slice(0, 500), // Limit title length
          content: article.content.slice(0, 2000), // Limit content length
          summary: article.content.slice(0, 300), // Short summary
          source_name: article.source_name,
          source_url: article.source_url,
          source_handle: null,
          location_name: location.location_name,
          geotag_lat: location.geotag_lat,
          geotag_lng: location.geotag_lng,
          location_extracted: location.geotag_lat !== null,
          category: location.category,
          tags: this.extractTags(article.title + ' ' + article.content),
          confidence_score: location.confidence_score,
          published_at: article.published_at.toISOString(),
          content_hash: article.content_hash,
          status: 'active',
        };
      });

      // Step 5: Filter records with valid location data (confidence > 50)
      const validRecords = records.filter((r) => r.confidence_score > 50);
      console.log(
        `[OsintIngestion] ${validRecords.length} records with valid locations (>${
          records.length - validRecords.length
        } filtered out)`
      );

      if (validRecords.length === 0) {
        console.log('[OsintIngestion] No records with sufficient confidence to insert');
        return { success: true, processed: articles.length, inserted: 0 };
      }

      // Step 6: Insert into database
      const { data, error } = await this.getSupabase().from('osint_signals').insert(validRecords);

      if (error) {
        console.error('[OsintIngestion] Insert error:', error);
        return { success: false, error: error.message, processed: articles.length, inserted: 0 };
      }

      console.log(`[OsintIngestion] ✅ Successfully inserted ${validRecords.length} new signals`);

      return {
        success: true,
        processed: articles.length,
        inserted: validRecords.length,
        skipped: articles.length - validRecords.length,
      };
    } catch (error) {
      console.error('[OsintIngestion] Fatal error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
        inserted: 0,
      };
    }
  }

  /**
   * Extract relevant tags from text
   */
  private extractTags(text: string): string[] {
    const keywords = [
      'breaking',
      'urgent',
      'update',
      'conflict',
      'war',
      'attack',
      'election',
      'crypto',
      'bitcoin',
      'ethereum',
      'security',
      'breach',
      'hack',
      'weather',
      'disaster',
      'earthquake',
      'fire',
    ];

    const lowerText = text.toLowerCase();
    const foundTags = keywords.filter((keyword) => lowerText.includes(keyword));

    return foundTags.slice(0, 5); // Max 5 tags
  }

  /**
   * Clean up old signals (keep last 7 days)
   */
  async cleanupOldSignals() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error } = await this.getSupabase()
      .from('osint_signals')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('[OsintIngestion] Cleanup error:', error);
    } else {
      console.log('[OsintIngestion] Cleaned up old signals');
    }
  }
}

export const osintIngestionService = new OsintIngestionService();
