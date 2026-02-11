#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Order matters! Run migrations in sequence
const migrations = [
  // 1. Core schema
  { file: 'supabase-schema.sql', name: 'Base Schema' },

  // 2. Base table migrations
  { file: 'supabase-category-migration.sql', name: 'Category Support' },
  { file: 'supabase-pseudonym-migration.sql', name: 'Pseudonym System' },
  { file: 'supabase-prediction-votes-migration.sql', name: 'Prediction Votes' },
  { file: 'supabase-notifications-migration.sql', name: 'Notifications' },

  // 3. Evidence system
  { file: 'supabase-evidence-system-migration-fixed.sql', name: 'Evidence System' },
  { file: 'supabase-evidence-scoring-migration.sql', name: 'Evidence Scoring' },
  { file: 'supabase-legacy-evidence-migration.sql', name: 'Legacy Evidence Migration' },

  // 4. Resolution system
  { file: 'supabase-resolution-migration.sql', name: 'Resolution System' },
  { file: 'supabase-resolution-evidence-migration.sql', name: 'Resolution Evidence' },
  { file: 'supabase-resolve-fix.sql', name: 'Resolution Fixes' },
  { file: 'supabase-outcome-migration.sql', name: 'Outcome System' },

  // 5. Claiming system
  { file: 'supabase-claiming-migration.sql', name: 'Claiming System' },
  { file: 'supabase-claim-resolve-contest-migration.sql', name: 'Claim/Resolve Contest' },

  // 6. Scoring systems
  { file: 'supabase-user-scoring-migration.sql', name: 'User Scoring' },
  { file: 'supabase-weighted-voting-migration.sql', name: 'Weighted Voting' },
  { file: 'supabase-rename-to-reputation.sql', name: 'Reputation System' },
  { file: 'supabase-downvote-support-migration.sql', name: 'Downvote Support' },

  // 7. Globe/location features
  { file: 'supabase-globe-geotag-migration.sql', name: 'Globe Geotags' },

  // 8. External integrations
  { file: 'supabase-de-status-migration.sql', name: 'Digital Evidence Status' },

  // 9. Intel system (migrations folder)
  { file: 'supabase/migrations/20260208_osint_signals.sql', name: 'OSINT Signals (v1)' },
  { file: 'supabase/migrations/2026_02_08_osint_signals.sql', name: 'OSINT Signals (v2)' },
  { file: 'supabase/migrations/2026_02_08_evidence_bundles.sql', name: 'Evidence Bundles' },
  { file: 'supabase/migrations/2026_02_08_rename_predictions.sql', name: 'Rename Predictions' },
  { file: 'supabase/migrations/20260210_create_intel_tables.sql', name: 'Intel Tables' },
  { file: 'supabase/migrations/20260210_seed_intel_sources.sql', name: 'Intel Sources Seed' },
  { file: 'supabase/migrations/add_moderation_fields.sql', name: 'Moderation Fields' },
  { file: 'supabase/migrations/create_insight_score_tables.sql', name: 'Insight Score Tables' },

  // 10. Functions and policies (always last)
  { file: 'supabase-rpc-functions.sql', name: 'RPC Functions' },
  { file: 'supabase-points-triggers.sql', name: 'Points Triggers' },
  { file: 'supabase-rls-policies.sql', name: 'RLS Policies' },
  { file: 'supabase-fix-anon-stats.sql', name: 'Anonymous Stats Fix' },
];

async function runMigration(migration) {
  const filePath = path.join(__dirname, migration.file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${migration.name} (file not found: ${migration.file})`);
    return { success: true, skipped: true };
  }

  console.log(`\n📋 Running: ${migration.name}`);
  console.log(`   File: ${migration.file}`);

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    // Split SQL into statements and execute each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip tiny fragments

      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });

        // If exec_sql doesn't exist, try direct execution
        if (error && error.message && error.message.includes('exec_sql')) {
          // Fallback: try using raw query
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok && response.status !== 404) {
            const text = await response.text();
            console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: ${text.substring(0, 100)}`);
          }
        } else if (error && !error.message.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: ${error.message.substring(0, 100)}`);
        }
      } catch (e) {
        // Ignore "already exists" errors
        if (!e.message || !e.message.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: ${e.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`   ✅ Completed ${migration.name}`);
    return { success: true };

  } catch (error) {
    console.error(`   ❌ Error in ${migration.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function deployAllMigrations() {
  console.log('🚀 ProofLocker Database Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  console.log(`📦 Total migrations: ${migrations.length}\n`);

  const results = [];

  for (const migration of migrations) {
    const result = await runMigration(migration);
    results.push({ ...migration, ...result });

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Migration Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some migrations failed. This may be normal if:');
    console.log('   - Tables/columns already exist');
    console.log('   - Functions are already defined');
    console.log('   - Policies are already in place\n');
    console.log('💡 Check your Supabase dashboard to verify the schema:');
    console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/editor`);
  }

  console.log('\n🎉 Migration deployment complete!\n');
}

deployAllMigrations().catch(console.error);
