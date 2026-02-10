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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndMigrate() {
  console.log('🔍 Checking intel_items table...\n');

  // Check if table exists by trying to query it
  const { data, error } = await supabase
    .from('intel_items')
    .select('id')
    .limit(1);

  if (error) {
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('❌ intel_items table does not exist');
      console.log('📝 Running migration...\n');

      // Read and run migration
      const migrationPath = path.join(__dirname, 'supabase/migrations/20260210_create_intel_tables.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Split SQL into statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        console.log(`Running statement ${i + 1}/${statements.length}...`);
        const { error: execError } = await supabase.rpc('exec_sql', {
          sql_query: statements[i] + ';'
        });

        if (execError) {
          console.error(`⚠️  Statement ${i + 1} error:`, execError.message);
        }
      }

      console.log('✅ Migration complete\n');
    } else {
      console.error('❌ Error querying table:', error.message);
      return;
    }
  } else {
    console.log('✅ intel_items table exists');
    console.log(`📊 Found ${data?.length || 0} items\n`);
  }

  // Count items
  const { count, error: countError } = await supabase
    .from('intel_items')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting items:', countError.message);
  } else {
    console.log(`📈 Total intel items: ${count || 0}`);
  }

  // Check intel_sources
  const { data: sources, error: sourcesError } = await supabase
    .from('intel_sources')
    .select('*');

  if (sourcesError) {
    console.error('❌ Error querying sources:', sourcesError.message);
  } else {
    console.log(`📡 Total intel sources: ${sources?.length || 0}`);
    if (sources && sources.length > 0) {
      console.log('\nSources:');
      sources.forEach(s => {
        console.log(`  - ${s.name} (${s.type}) - ${s.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      });
    }
  }
}

checkAndMigrate().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
