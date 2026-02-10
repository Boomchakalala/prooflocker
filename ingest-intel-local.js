#!/usr/bin/env node
/**
 * OSINT Intel Ingestion Script
 * Fetches RSS feeds from intel_sources and populates intel_items
 * Run with: node ingest-intel-local.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Load env
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple XML parser for RSS feeds
function parseRSS(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi);

  if (!itemMatches) return items;

  itemMatches.forEach(itemXml => {
    const getTag = (tag) => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
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
        summary: description,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      });
    }
  });

  return items;
}

// Fetch URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Hash URL for deduplication
function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

// Map intel tags to standard categories
function mapTagsToCategory(tags) {
  if (!tags || tags.length === 0) return 'other';

  const tagStr = tags.join(' ').toLowerCase();

  // Politics-related
  if (tagStr.match(/politics|election|government|diplomatic|sanctions|ceasefire|coup/)) return 'politics';

  // Military/Conflict
  if (tagStr.match(/military|conflict|war|drone|missile|attack|osint|geoint|investigative/)) return 'politics';

  // Cyber/Tech
  if (tagStr.match(/cyber|tech|data breach|ransomware|disinformation/)) return 'tech';

  // Markets/Economics
  if (tagStr.match(/markets|economics|crypto|bitcoin/)) return 'markets';

  // Sports
  if (tagStr.match(/sports|olympics|football|soccer|hockey/)) return 'sports';

  // Culture/General news
  if (tagStr.match(/culture|entertainment|world|breaking|general/)) return 'culture';

  // Natural disasters
  if (tagStr.match(/earthquake|wildfire|natural-disaster|disaster/)) return 'other';

  return 'other';
}

async function ingestFeed(source) {
  console.log(`\n📡 Fetching: ${source.name}`);

  try {
    const xml = await fetchUrl(source.url);
    const items = parseRSS(xml);

    console.log(`   Found ${items.length} items`);

    let inserted = 0;
    for (const item of items.slice(0, 10)) { // Limit to 10 per source
      const urlHash = hashUrl(item.url);

      // Check if already exists
      const { data: existing } = await supabase
        .from('intel_items')
        .select('id')
        .eq('url_hash', urlHash)
        .single();

      if (existing) continue;

      // Insert new item
      const category = mapTagsToCategory(source.tags);
      const { error } = await supabase
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
          country_code: 'US', // Default for now
        });

      if (!error) inserted++;
    }

    console.log(`   ✅ Inserted ${inserted} new items`);

    // Update last polled time
    await supabase
      .from('intel_sources')
      .update({ last_polled_at: new Date().toISOString() })
      .eq('id', source.id);

  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 Starting intel ingestion...\n');

  // Get enabled sources
  const { data: sources, error } = await supabase
    .from('intel_sources')
    .select('*')
    .eq('enabled', true)
    .order('last_polled_at', { ascending: true, nullsFirst: true })
    .limit(15); // Process 15 sources per run

  if (error) {
    console.error('❌ Failed to fetch sources:', error.message);
    process.exit(1);
  }

  console.log(`📊 Processing ${sources.length} sources\n`);

  for (const source of sources) {
    await ingestFeed(source);
  }

  // Count total items
  const { count } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Ingestion complete! Total items in DB: ${count}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
