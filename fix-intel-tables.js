#!/usr/bin/env node
/**
 * This script creates the intel_items table by executing SQL via Supabase service role
 * Run with: node fix-intel-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔧 Creating intel_items and intel_sources tables...\n');

  // Create tables one by one with proper error handling
  const tables = [
    {
      name: 'intel_sources',
      sql: `
        CREATE TABLE IF NOT EXISTS intel_sources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('google_news_rss', 'rss', 'gdelt', 'legacy_api')),
          url TEXT NULL,
          enabled BOOLEAN NOT NULL DEFAULT true,
          poll_every_minutes INTEGER NOT NULL DEFAULT 10,
          last_polled_at TIMESTAMPTZ NULL,
          tags TEXT[] NULL,
          metadata JSONB NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    },
    {
      name: 'intel_items',
      sql: `
        CREATE TABLE IF NOT EXISTS intel_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          source_id UUID REFERENCES intel_sources(id) ON DELETE SET NULL,
          source_name TEXT NOT NULL,
          source_type TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          canonical_url TEXT NULL,
          url_hash TEXT NOT NULL,
          published_at TIMESTAMPTZ NULL,
          summary TEXT NULL,
          author TEXT NULL,
          image_url TEXT NULL,
          tags TEXT[] NULL,
          raw JSONB NULL,
          country_code TEXT NULL,
          place_name TEXT NULL,
          lat DOUBLE PRECISION NULL,
          lon DOUBLE PRECISION NULL,
          geo_confidence INTEGER NULL CHECK (geo_confidence BETWEEN 0 AND 100),
          geo_method TEXT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    console.log(`Creating ${table.name}...`);
    const { error } = await supabase.rpc('exec_sql', { sql: table.sql });

    if (error) {
      console.error(`❌ Error creating ${table.name}:`, error.message);
      console.log('\n📝 MANUAL FIX REQUIRED:');
      console.log('Visit: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new');
      console.log(`\nCopy and run the SQL from:\nsupabase/migrations/20260210_create_intel_tables.sql`);
      console.log(`\nThen run:\nsupabase/migrations/20260210_seed_intel_sources.sql`);
      process.exit(1);
    }
    console.log(`✅ ${table.name} created\n`);
  }

  console.log('✅ Tables created successfully!\n');
  console.log('Next step: Run seed data');
  console.log('node seed-intel-sources.js');
}

createTables().catch(err => {
  console.error('❌ Fatal error:', err.message);
  console.log('\n📝 MANUAL FIX - Go to Supabase SQL Editor and run:');
  console.log('https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new');
  console.log('\n1. Copy contents of: supabase/migrations/20260210_create_intel_tables.sql');
  console.log('2. Click "Run"');
  console.log('3. Copy contents of: supabase/migrations/20260210_seed_intel_sources.sql');
  console.log('4. Click "Run"');
  process.exit(1);
});
