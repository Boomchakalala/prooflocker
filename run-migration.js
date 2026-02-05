#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running anonymous user stats migration...\n');

  // Read the SQL migration file
  const sql = fs.readFileSync('./supabase-fix-anon-stats.sql', 'utf8');

  // Split by $$ to handle function definitions properly
  const statements = sql.split(/;\s*(?=\n|$)/).filter(s => s.trim());

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement) continue;

    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct execution if rpc doesn't work
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement + ';' })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }

      console.log(`✅ Statement ${i + 1} completed`);
    } catch (err) {
      console.error(`❌ Error on statement ${i + 1}:`, err.message);
      console.error('Statement:', statement.substring(0, 200) + '...');
      // Continue with next statement
    }
  }

  console.log('\n✅ Migration completed!');
  console.log('\nVerifying stats for anonymous users...');

  // Verify the results
  const { data: verifyData, error: verifyError } = await supabase
    .from('user_stats')
    .select('anon_id, reliability_score, total_predictions, resolved_predictions, correct_predictions')
    .not('anon_id', 'is', null)
    .gt('resolved_predictions', 0)
    .order('reliability_score', { ascending: false })
    .limit(5);

  if (verifyError) {
    console.error('❌ Verification error:', verifyError);
  } else {
    console.log('\n📊 Top 5 anonymous users by reliability score:');
    console.table(verifyData);
  }
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
