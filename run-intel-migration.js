#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Running Intel Tables migration...\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20260210_create_intel_tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Use Supabase Management API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Migration failed:', text);

      // Try alternative approach: execute via psql or use SQL Editor URL
      console.log('\n📝 Please run the migration manually:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Copy and paste the contents of: supabase/migrations/20260210_create_intel_tables.sql');
      console.log('4. Run the SQL');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');

    // Now run the seed data migration
    const seedPath = path.join(__dirname, 'supabase/migrations/20260210_seed_intel_sources.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Running seed data...\n');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      const seedResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: seedSql })
      });

      if (seedResponse.ok) {
        console.log('✅ Seed data loaded!\n');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 Manual migration required. Please:');
    console.log('1. Go to: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new');
    console.log('2. Copy contents from: supabase/migrations/20260210_create_intel_tables.sql');
    console.log('3. Click "Run"');
    console.log('4. Then copy and run: supabase/migrations/20260210_seed_intel_sources.sql');
    process.exit(1);
  }
}

runMigration();
